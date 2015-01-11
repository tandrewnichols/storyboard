var nconf = require('nconf');
var neoconf = nconf.get('neo4j');
var neo4j = require('neo4jmapper');
var db = new neo4j(neoconf.connection);
var aggregator = require('../model-aggregator');
var node = require('../node')(db);
var extend = require('config-extend');
var async = require('async');

var ready = false;
var models = {};

// Add custom static and instance methods to the Node class
extend(db.Node, node.static);
extend(db.Node.prototype, node.proto);

// Asynchronous, but not passing a callback
var emitter = aggregator.map(db.Node);

// Instead, we'll listen for the end event and tell the
// middleware handler we're ready to process requests
emitter.on('end', function(classes) {
  models = classes;
  ready = true;
});

module.exports = function(req, res, next) {
  // Wait for model registration to complete
  async.whilst(
    function() { return !ready },
    // setImmediate takes a function. Async.whilst
    // passes a single function that tells async
    // to check the truth test again.
    setImmediate,
    function(err) {
      // TODO: do something better here eventually
      if (err) throw err;
      else {
        // Save some things off to the req object for easy access later
        req.graph = db;
        req.Node = db.Node;
        req.Relationship = db.Relationship;
        req.Graph = db.Graph;
        req.Transaction = db.Transaction;
        req.models = models;
        next();
      }
    }
  );
};
