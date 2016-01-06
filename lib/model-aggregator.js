var fm = require('file-manifest');
var _ = require('lodash');
var extend = require('config-extend');
var async = require('async');
var EventEmitter = require('events').EventEmitter;

/*
 * Collect all the models
 */
var models = fm.generate('../models', '**/*.js', function(options, manifest, file) {
  // Get classified names based on directory path,
  // joining with .children. to keep inheritance hierarchy
  var names = file.relativeName.split('/').map(function(part) {
    return _.classify(part);
  }).join('.children.');
  _.expand(manifest, names, { model: require(file.fullPath) });
  return manifest;
});

/*
 * Recursively register the models.
 * @param {Node} nodeType: The parent class (e.g. Node)
 * @param {Object} typeModels: The children of the parent model
 */
exports.map = function(nodeType, typeModels, cb) {
  // The first time, we pass only "nodeType" because
  // we want to use all the models collected above
  typeModels = typeModels || models;

  // Get all the model names
  var labels = _.keys(typeModels);

  // Create an event emitter to return
  var emitter = new EventEmitter();

  // Asynchronously iterate over the current set of labels. Using async
  // and the callback version of registerModel because that will call
  // "ensureIndex", which will create indexes and unique constraints
  async.reduce(labels, {}, function(memo, label, next) {
    // For each child, register the model using the parent's registerModel method
    // so that the child inherits from the parent
    nodeType.registerModel(label, typeModels[label].model.instance || {}, function(err, Class) {
      // Extend the type itself with any additional static methods
      extend(Class, typeModels[label].model.static || {});
      memo[label] = Class;

      // If the current class has children, call map again with the Class
      // we just register, the object of children, and a callback to
      // receive all the children
      if (typeModels[label].children) {
        exports.map(Class, typeModels[label].children, function(children) {
          next(null, extend(memo, children));
        });
      } else {
        // If no children, we're done iterating. Just call nex with memo.
        next(null, memo);
      }
    });
  }, function(err, classes) {
    // TODO: Do something better with this.
    if (err) throw err;
    // This will be true for all the recursive calls but not the top level call
    else if (typeof cb === 'function') cb(classes);
    // For the top level call, emit that we're finished processing.
    else emitter.emit('end', classes);
  });

  // Return the emitter so it can listen for the 'end' event
  return emitter;
};
