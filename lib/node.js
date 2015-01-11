var uuid = require('uuid');
var async = require('async');

module.exports = function(db) {
  return {

    // Extends the Node instance
    proto: {
      fields: {
        indexes: {
          uid: true
        },
        unique: {
          uid: true
        },
        defaults: {
          createdTime: function() {
            return Date.now();
          },
          updatedTime: function() {
            return Date.now();
          },
          uid: uuid.v4
        }
      },

      /*
       * Simple function to grab the data we care about.
       * Also useful for overriding (as in the Author class)
       */
      toJson: function() {
        return this.data;
      },

      // Attach the Graph, Transaction, and Relationship objects to the class instance
      Graph: db.Graph,
      Transaction: db.Transaction,
      Relationship: db.Relationship
    },

    // Extends the Node class
    static: {
      createNodes: function(nodes, cb) {
        async.map(nodes, function(node, next) {
          node.model[node.func || 'create'](node.data, next);
        }, cb);
      },

      createRelations: function(relations, cb) {
        async.map(relations, function(rel, next) {
          rel.from.createRelationTo(rel.to, rel.type, next);
        }, cb);
      },

      get: function(uid, cb) {
        return db.Node.find({ uid: uid }).limit(1, cb);
      }
    }
  };
};
