var router = module.exports = require('express').Router();
var _ = require('lodash');

// Create a new world
router.post('/', function(req, res, next) {
  req.models.World.create(req.body, function(err, world) {
    if (err) return next(err);
    req.author.createRelationTo(world, 'CREATED', function(err, rel) {
      if (err) return next(err);
      res.status(200).json(world.data);
    });
  });
});

// Get all worlds associated with this user
router.get('/', function(req, res, next) {
  req.author.getAllByType('World', function(err, worlds) {
    if (err) return next(err);
    res.status(200).json(_.pluck(worlds, 'data'));
  });
});

router.put('/:uid', function(req, res, next) {
  
});
