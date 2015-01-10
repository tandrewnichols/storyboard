var router = module.exports = require('express').Router();
var _ = require('lodash');

// Create a new world
router.post('/', function(req, res, next) {
  var nodes = [
    { model: req.models.Story, data: _.omit(req.body, 'world') },
    { model: req.models.World, data: { name: req.body.world }, func: 'findOrCreate' }
  ];

  req.Node.createNodes(nodes, function(err, nodes) {
    if (err) res.sendError(err);
    else {
      var story = nodes[0];
      var world = nodes[1];
      var rels = [
        { to: story, from: req.author, type: 'CREATED' },
        { to: story, from: world, type: 'HAS' }
      ];

      req.Node.createRelations(rels, function(err, rels) {
        if (err) res.sendError(err);
        else {
          // Wrap this into a .createUniqueRelationship function on Node (or instance)
          req.Graph.start().match('(a:Author),(w:World)').where({ 'a.uid': req.author.data.uid, 'w.uid': world.data.uid }).createUnique('(a)-[r:CREATED]->(w)').return('r', function(err, rel) {
            if (err) res.sendError(err);
            else res.status(200).json(story.data);
          });
        }
      });
    }
  });
});

// Get all stories on all worlds for a user
router.get('/', function(req, res, next) {
  req.author.getAllByType('Story', function(err, nodes) {
    if (err) res.sendError(err);
    else res.status(200).json(_.pluck(nodes, 'data'));
  });
});
