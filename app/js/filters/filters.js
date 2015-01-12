angular.module('app')
  .filter('titleize', function() {
    return function(str) {
      return _.titleize(str);
    };
  })
  .filter('equals', function() {
    return function(obj1, obj2) {
      return angular.equals(obj1, obj2);
    };
  });
