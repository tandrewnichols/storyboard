var _ = require('lodash');
_.mixin(require('underscore.string'));
_.mixin(require('safe-obj'));
_.mixin({
  unpair: function(arr) {
    return _.reduce(arr, function(memo, item, index) {
      if (index % 2 === 0) {
        memo[item] = null;
      } else {
        memo[arr[index - 1]] = item;
      }
      return memo;
    }, {});
  },
  chunk: function(arr, num) {
    num = num || 1;
    return _.reduce(arr, function(memo, item) {
      if (_.last(memo).length === num) {
        memo.push([ item ]);
      } else {
        _.last(memo).push(item);
      }
      return memo;
    }, [ [] ]);
  }
});

module.exports = function() {
  return _;
};
