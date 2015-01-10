var fm = require('file-manifest');
var _ = require('lodash');
var express = require('express');
var params = require('express-params');
var isConnected = require('./middleware/isConnected');

// Collect all the models
var models = fm.generate('../../models', '**/*.js', function(options, manifest, file) {
  // Get classified names based on directory path
  // Join with .children so expanding puts sub node types under
  // the right parent
  var names = file.relativeName.split('/').map(function(part) {
    return _.classify(part);
  }).join('.children.');
  _.expand(manifest, names, { model: require(file.fullPath) });
  return manifest;
});

// Recursively register the models.
// "nodeType" is the parent type (e.g. Node, the first time)
// " typeModels" is all the sub types of that type
exports.map = function(nodeType, typeModels) {
  var labels = _.keys(typeModels);
  return  _.reduce(labels, function(memo, label) {
    // For each child, register the model using the parent's registerModel method
    memo[label] = nodeType.registerModel(label, typeModels[label].model.instance || {});

    // Extend the type itself with any additional static methods
    _.extend(memo[label], typeModels[label].model.static || {});

    // Create a router and initialize express-params
    var router = express.Router();
    params.extend(router);

    // And setup a regex match for uid, so that other routes can be added
    // after these routes without these consuming them
    router.param('uid', /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/);

    // Add RESTful routes
    _.each(['get', 'put', 'post', 'del'], function(method) {
      // e.g. router.get('/:uid', Author.get.bind(Author))
      router[method]('/:uid', isConnected, memo[label][method].bind(memo[label]));
    });
    router.post('/', isConnected, memo[label].post.bind(memo[label]));

    // Store references to the router
    memo[label].router = router;
    memo[label].prototype.router = router;

    // If the current type has children, recursively register them,
    // otherwise, return.
    if (typeModels[label].children) {
      return _.extend(memo, exports.map(memo[label], typeModels[label].children));
    } else {
      return memo;
    }
  }, {});
};
