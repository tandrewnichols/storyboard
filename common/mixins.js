;(function() {
  // Determine whether we're in node or the browser
  var root = typeof window !== 'undefined' ? window : module.exports;

  // Should be safe since, in the browser, this will short circuit
  // and only run the first part
  var _ = root._ || require('lodash');

  var mixins = {
    // Convert an array into an object, where each set of values
    // become the key/value pair in the object
    unpair: function(arr) {
      return _.reduce(arr, function(memo, item, index) {
        // Even numbers will be the keys
        if (index % 2 === 0) {
          memo[item] = null;
        }
        // Odd numbers will be the values 
        else {
          memo[arr[index - 1]] = item;
        }
        return memo;
      }, {});
    },

    // Like unpair, but converts arrays, into nested arrays with
    // "num" items in each inner array
    chunk: function(arr, num) {
      num = num || 1;
      return _.reduce(arr, function(memo, item) {
        // If the previous inner array is full, push a new array on
        if (_.last(memo).length === num) {
          memo.push([ item ]);
        }
        // Otherwise, add this item on to the end of the last array 
        else {
          _.last(memo).push(item);
        }
        return memo;
      }, [ [] ]);
    },

    extractDiff: function(copy, origin) {
      var diff = {};
      if (_.isEqual(copy, origin)) {
        return _.clone(copy);
      } else {
        for (var k in copy) {
          if (!_.isEqual(copy[k], origin[k])) {
            if (!origin[k]) {
              diff[k] = _.clone(copy[k]);
            } else if (_.isPlainObject(copy[k])) {
              var inner = mixins.extractDiff(copy[k], origin[k]);
              if (inner) {
                diff[k] = _.clone(inner);
              }
            } else if (_.isArray(copy[k])) {
              var arr = [];
              _.each(copy[k], function(item, i) {
                var inner = mixins.extractDiff(copy[k][i], origin[k][i]);
                if (inner) {
                  arr.push(_.clone(inner));
                }
              });

              if (arr.length) {
                diff[k] = _.clone(arr);
              }
            } else if (copy[k] !== origin[k]) {
              diff[k] = _.clone(copy[k]);
            }
          }
        }

        return diff;
      }
    }
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = mixins;
  } else if (typeof window !== 'undefined') {
    window._._mixins = mixins;
  }
})();
