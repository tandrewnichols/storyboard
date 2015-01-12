var _ = require('lodash');
_.mixin(require('underscore.string'));
_.mixin(require('safe-obj'));
_.mixin(require('../common/mixins'));

module.exports = function() {
  return _;
};
