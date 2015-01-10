var extend = require('config-extend');
var nconf = require('nconf');
var neoconf = nconf.get('neo4j');
var neo4j = require('neo4jmapper');
var db = new neo4j(neoconf.connection);
var node = require('../node');
var aggregator = require('../model-aggregator');

extend(db.Node.prototype, node.proto);
extend(db.Node, node.static);
var classes = aggregator.map(db.Node, models);

var middleware = function(req, res, next) {
  req.graph = db;
  req.Node = db.Node;
  req.Relationship = db.Relationship;
  req.Graph = db.Graph;
  req.Transaction = db.Transaction;
  req.models = classes;
  next();
};

middleware.models = classes;
module.exports = middleware;
