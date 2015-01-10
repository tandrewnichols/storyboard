var crypto = require('crypto');
var util = require('util');
var _ = require('lodash');
var nconf = require('nconf');

var gravatar = function(node) {
  var md5 = crypto.createHash('md5');
  if (typeof node === 'object') {
    md5.update(node.data.email);
  } else if (typeof node === 'string') {
    md5.update(node);
  }
  return util.format('http://www.gravatar.com/avatar/%s?d=mm', md5.digest('hex'));
};

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
    get: function() {
      return _.omit(this.data, 'password');
    },
    encrypt: function() {
      return encrypt(this.data.uid);
    },
    decrypt: function() {
      return decrypt(this.data.uid);
    },
    changeEmail: function(email, cb) {
      return this.update({ email: email, gravatar: gravatar(email) }, cb);
    },
    getAll: function(type, limit, cb) {
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
    }
  },
  static: {
    encrypt: encrypt,
    decrypt: decrypt,
    changeEmail: function(uid, email, cb) {
      return this.get(uid).update({ email: email, gravatar: gravatar(email) }, cb);
    }
  }
};
