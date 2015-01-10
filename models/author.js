var crypto = require('crypto');
var util = require('util');
var _ = require('lodash');
var nconf = require('nconf');

var compare = function(orig, cmp) {
  var sentinel;
  if (orig.length !== cmp.length) return false;
  for (var i = 0; i <= (orig.length - 1); i++) {
    sentinel |= orig.charCodeAt(i) ^ cmp.charCodeAt(i);
  }
  return sentinel === 0;
};

var encrypt = function(text) {
  var iv = new Buffer(crypto.randomBytes(16));
  var cipher = crypto.createCipheriv('AES-256-CBC', new Buffer(nconf.get('cipherKey')), iv);
  cipher.setEncoding('hex');
  cipher.write(text);
  cipher.end();
  var cipherText = cipher.read();
  var hmac = crypto.createHmac('SHA256', nconf.get('hmacKey'));
  hmac.update(cipherText);
  hmac.update(iv.toString('hex'));
  return [cipherText, iv.toString('hex'), hmac.digest('hex')].join('$');
};

var decrypt = function(cipher) {
  var cipherBlob = cipher.split('$');
  var cipherText = cipherBlob[0];
  var iv = new Buffer(cipherBlob[1], 'hex');
  var hmacDigest = cipherBlob[2];
  var hmac = crypto.createHmac('SHA256', nconf.get('hmacKey'));
  hmac.update(cipherText);
  hmac.update(iv.toString('hex'));
  if (!compare(hmacDigest, hmac.digest('hex'))) return null; 
  else {
    var decipher = crypto.createDecipheriv('AES-256-CBC', new Buffer(nconf.get('cipherKey')), iv);
    var decrypted = decipher.update(cipherText, 'hex', 'utf8');
    return decrypted + decipher.final('utf8');
  }
};

module.exports = {
  instance: {
    fields: {
      indexes: {
        email: true
      },
      defaults: {
        theme: 'spacelab',
        inverse: true,
        gravatar: gravatar
      },
      unique: {
        email: true
      }
    },

    // Override base implementation to leave password out
    toJson: function() {
      return _.omit(this.data, 'password');
    },

    // Encrypt the current user's uid
    encrypt: function() {
      return encrypt(this.data.uid);
    },

    // Decrypt the current user's uid
    decrypt: function() {
      return decrypt(this.data.uid);
    },

    // Get all nodes connected by relationship "type"
    getAllByType: function(type, limit, cb) {
      if (typeof limit === 'function') {
        cb = limit;
        limit = 5;
      }
      var query = this.Graph.start().match('(a:Author)-[:CREATED]->(n:' + type + ')').where({ 'a.uid': this.data.uid }).return('n').orderBy('n.createdDate')
      if (limit) { 
        query.limit(limit, cb);
      } else {
        query.exec(cb);
      }
    },

    // Determine whether a node is connected to this node, at any length
    isConnected: function(node, cb) {
      if (typeof node === 'object') node = node.data.uid;
      if (this.data.uid === node) cb(null, true);
      else this.Graph.query('match (a)-[r*]-(n) where a.uid = ' + this.data.uid + ' and n.uid = ' + node + ' return n', cb);
    },

    // Override base version of onBeforeSave
    onBeforeSave: function(node, cb) {
      if (node.data.email) {
        var md5 = crypto.createHash('md5');
        md5.update(node.data.email);
        node.data.gravatar = util.format('http://www.gravatar.com/avatar/%s?d=mm', md5.digest('hex'));
      }
    }
  },
  static: {
    // Static implementations of the above
    encrypt: encrypt,
    decrypt: decrypt
  }
};
