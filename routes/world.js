var router = module.exports = require('express').Router();
var _ = require('lodash');

/*
 * Create a new world
 * Invocation: Api.World.create
 */
router.post('/', function(req, res, next) {
  req.models.World.create(req.body, function(err, world) {
    if (err) return next(err);
    req.author.createRelationTo(world, 'CREATED', function(err, rel) {
      if (err) return next(err);
      res.status(200).json(world.data);
    });
  });
});

/*
 * Get all worlds associated with this user
 * Invocation: Api.World.get
 */
router.get('/', function(req, res, next) {
  req.author.getAllByType('World', function(err, worlds) {
    if (err) return next(err);
    res.status(200).json(_.pluck(worlds, 'data'));
  });
});

/*
 * Update an existing world
 * Invocation: Api.World.update
 */
router.put('/:uid', router.middleware.uid, function(req, res, next) {
  req.models.World.find({ uid: req.params.uid }).update(req.body, function(err, world) {
    if (err) return next(err);
    res.status(200).json(world.toJson());
  });
});

/*
 * Delete an existing world
 * Invocation: Api.World.remove
 */
router.delete('/:uid', router.middleware.uid, function(req, res, next) {
  req.models.World.find({ uid: req.params.uid }).deleteIncludingRelations(function(err, world) {
    console.log(arguments);
    if (err) return next(err);
    res.status(200).end();
  });
});
