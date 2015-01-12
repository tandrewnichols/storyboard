var crypto = require('crypto');
var util = require('util');
var _ = require('lodash');
var nconf = require('nconf');
var util = require('util');

module.exports = {
  instance: {
    fields: {
      indexes: {
        email: true
      },
      defaults: {
        theme: 'spacelab',
        inverse: true,
        gravatar: function(node) {
          return module.exports.static.gravatar(node);
        }
      },
      unique: {
        email: true
      }
    },

    plural: 'authors',

    /*
     * Override the base implementation to leave password out
     */
    toJson: function() {
      return _.omit(this.data, 'password');
    },

    /*
     * Encrypt the current user's uid
     */
    encrypt: function() {
      return module.exports.static.encrypt(this.data.uid);
    },

    /*
     * Decrypt the current user's uid
     */
    decrypt: function() {
      return module.exports.static.decrypt(this.data.uid);
    },

    /*
     * Update a user's email and gravatar
     */
    changeEmail: function(email, cb) {
      return this.update({ email: email, gravatar: module.exports.static.gravatar(email) }, cb);
    },

    /*
     * Get all nodes of type "type" that were created by this author
     * @param {String|Array} type - The type or types to fetch
     * @param {Number} limit - The number of nodes to return
     * @param {Function} cb - The callback
     */
    getAllByType: function(type, limit, cb) {
      var self = this;

      // Make sure type is an array
      if (typeof type === 'string') {
        type = [ type ];
      }
      
      // If no limit is passed, default to 5
      if (typeof limit === 'function') {
        cb = limit;
        limit = 5;
      }

      // Set up the query once now
      var cypher = "match (a:Author)-[:CREATED]->(n:%s) where a.uid = '" + this.data.uid + "' with a, n order by n.createdDate" + (limit ? " limit " + limit : "") + " return n";
      var trans;

      _.each(type, function(t) {
        // Build the query for this type
        var query = util.format(cypher, _.classify(t));
        // If the transaction already exists, add a new query; otherwise, create one
        if (trans) {
          trans.add(query);
        } else {
          trans = self.Transaction.create(query);
        }
      });

      // Execute the query
      trans.exec(function(err, open) {
        if (err) return cb(err);
        // Commit the transaction
        open.commit(function(err, commit) {
          // commit.results looks like [ { columns: [...], data: [...] }, { columns: [...], data: [...] } ]
          // where each item corresponds to a query in the transaction
          var results = _.reduce(commit.results, function(memo, result, i) {
            // Get the class name
            var cls = _.classify(type[i]);
            // Find the plural form of the class
            var plural = self.Node.__models__[ cls ].plural;
            // Flatten the result set (sometimes it comes back as [ [ {...data...} ] ])
            memo[ plural ] = _.flatten(result.data);
            return memo;
          }, {});
          cb(err, results);
        });
      });
    },

    /*
     * Determine if this author can edit a given node
     * @param {Node|String} node - The node instance or string uid to be edited
     * @param {Function} cb - The callback
     */
    canEdit: function(node, cb) {
      var uid = typeof node === 'object' ? node.data.uid : node;
      // If the author is editing his/her own profile, allow it
      if (this.data.uid === uid) cb(null, this);
      else {
        var props = { author: this.data. uid, other: uid };
        this.Transaction
          .create('match (a {uid: author})-[:CREATED]->(created {uid: other}) return created', props)
          .add('match (a {uid: author})-[r:HAS_ACCESS]->(access {uid: other}) where r.type = \'write\' or r.type = \'full\' return access', props)
          .add('match (public {uid: other, access: \'public\' }) return public', { other: uid }, function(err, open) {
            open.commit(function(err, committed) {
              console.log(committed.results);
              if (err) cb(err, null);
              else if (committed.results) cb(null, committed.results);
              else cb(new Error('Author does not have write access to this node'), null);
            });
          });
      }
    },

    /*
     * Determine if this author can view a given node
     * @param {Node|String} node - The node instance or string uid to be viewed
     * @param {Function} cb - The callback
     */
    canView: function(node, cb) {
      // If the author is editing his/her own profile, allow it
      if (this === node) cb(null, this);
      else {
        var props = { author: this.data. uid, other: node.data.uid };
        this.Transaction
          .create('match (a {uid: author})-[:CREATED]->(created {uid: other}) return created', props)
          .add('match (a {uid: author})-[:HAS_ACCESS]->(access {uid: other}) return access', props)
          .add('match (public {uid: other, access: \'public\' }) return public', { other: node.data.uid }, function(err, open) {
            open.commit(function(err, committed) {
              console.log(committed.results);
              if (err) cb(err, null);
              else if (committed.results) cb(null, committed.results);
              else cb(null, null);
            });
          });
      }
    },
  },

  /*
   * Static methods for the Author class
   */
  static: {
    plural: 'authors',

    /*
     * Helper for the decrypt method to compare two hashes
     */
    compare: function(orig, cmp) {
      var sentinel;
      if (orig.length !== cmp.length) return false;
      // Loop over the hash and compare the bytes
      for (var i = 0; i <= (orig.length - 1); i++) {
        sentinel |= orig.charCodeAt(i) ^ cmp.charCodeAt(i);
      }
      return sentinel === 0;
    },

    /*
     * Encrypt the passed in text
     */
    encrypt: function(text) {
      // Create a random initialization vector
      var iv = new Buffer(crypto.randomBytes(16));
      // Create a cypher using a set cypher key and the above iv
      var cipher = crypto.createCipheriv('AES-256-CBC', new Buffer(nconf.get('cipherKey')), iv);
      // Set output to hex
      cipher.setEncoding('hex');
      // Encrypt the text
      cipher.write(text);
      cipher.end();
      // Get the full encrypted cypher out
      var cipherText = cipher.read();
      // Create a sha hash using a set hmac key
      var hmac = crypto.createHmac('SHA256', nconf.get('hmacKey'));
      // Hash the cipher
      hmac.update(cipherText);
      // Hash the hexified iv
      hmac.update(iv.toString('hex'));
      // Concat the cipher, hex iv, and sha digest with '$' so it can be decrypted later
      return [cipherText, iv.toString('hex'), hmac.digest('hex')].join('$');
    },

    /*
     * Decrypt the passed in cipher
     */
    decrypt: function(cipher) {
      // Split out the parts of the hash
      var cipherBlob = cipher.split('$');
      // Get the cipher, iv, and hash digest
      var cipherText = cipherBlob[0];
      var iv = new Buffer(cipherBlob[1], 'hex');
      var hmacDigest = cipherBlob[2];
      // Work backward to regenerate the hash digest in the same way so they can be compared
      var hmac = crypto.createHmac('SHA256', nconf.get('hmacKey'));
      hmac.update(cipherText);
      hmac.update(iv.toString('hex'));

      // Compare the original hash and the one here to prevent tampering
      if (!module.exports.static.compare(hmacDigest, hmac.digest('hex'))) return null;
      else {
        // Decipher the original value with the same iv
        var decipher = crypto.createDecipheriv('AES-256-CBC', new Buffer(nconf.get('cipherKey')), iv);
        var decrypted = decipher.update(cipherText, 'hex', 'utf8');
        return decrypted + decipher.final('utf8');
      }
    },

    /*
     * Update an author's email and gravatar
     */
    changeEmail: function(uid, email, cb) {
      return this.get(uid).update({ email: email, gravatar: module.exports.static.gravatar(email) }, cb);
    },

    /*
     * Hash an email for gravatar
     */
    gravatar: function(node) {
      // Gravatar requires a md5 hex hash of the email
      var md5 = crypto.createHash('md5');
      if (typeof node === 'object') {
        md5.update(node.data.email);
      } else if (typeof node === 'string') {
        md5.update(node);
      }
      return util.format('http://www.gravatar.com/avatar/%s?d=mm', md5.digest('hex'));
    }
  }
};
