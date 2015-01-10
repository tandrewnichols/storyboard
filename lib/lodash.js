var _ = require('lodash');
_.mixin(require('underscore.string'));
_.mixin(require('safe-obj'));

module.exports = function() {
  return _;
};
