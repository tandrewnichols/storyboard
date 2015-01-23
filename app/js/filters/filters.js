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
  })
  .filter('slugify', function() {
    return function(name) {
      return name.toLowerCase().replace(/\b(the|a|an|and|or)\b/g, '').trim().replace(/\s+/g, '-').replace(/[^0-9a-z]/g, '');
    };
  });
