var nconf = require('nconf');
var neoconf = nconf.get('neo4j');
var neo4j = require('neo4jmapper');
var db = new neo4j(neoconf.connection);
var fm = require('file-manifest');
var _ = require('lodash');
var uuid = require('uuid');
var async = require('async');

var models = fm.generate('../../models', '**/*.js', function(options, manifest, file) {
  var names = file.relativeName.split('/').map(function(part) {
    return _.classify(part);
  }).join('.children.');
  _.expand(manifest, names, { model: require(file.fullPath) });
  return manifest;
});

db.Node.prototype.fields.indexes.uid = true;
db.Node.prototype.fields.unique.uid = true;
db.Node.prototype.fields.defaults.createdTime = function() {
  return Date.now();
};
db.Node.prototype.fields.defaults.uid = uuid.v4

db.Node.createNodes = function(nodes, cb) {
  async.map(nodes, function(node, next) {
    node.model[node.func || 'create'](node.data, next);
  }, cb);
};

db.Node.createRelations = function(relations, cb) {
  async.map(relations, function(rel, next) {
    rel.from.createRelationTo(rel.to, rel.type, next);
  }, cb);
};

var map = function(nodeType, typeModels) {
  var labels = _.keys(typeModels);
  return  _.reduce(labels, function(memo, label) {
    memo[label] = nodeType.registerModel(label, typeModels[label].model.instance || {});
    _.extend(memo[label], typeModels[label].model.static || {});
    memo[label].get = function(uid, cb) {
      return memo[label].find({ uid: uid }).limit(1, cb);
    };
    memo[label].prototype.Graph = db.Graph;
    if (typeModels[label].children) {
      return _.extend(memo, map(memo[label], typeModels[label].children));
    } else {
      return memo;
    }
  }, {});
};
var classes = map(db.Node, models);

module.exports = function(req, res, next) {
  req.graph = db;
  req.Node = db.Node;
  req.Relationship = db.Relationship;
  req.Graph = db.Graph;
  req.Transaction = db.Transaction;
  req.models = classes;
  next();
};
