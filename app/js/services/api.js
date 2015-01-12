angular.module('app').factory('Api', function($resource, $rootScope) {
  return {
    World: $resource('/api/world/:uid', { uid: '@uid' }, { update: { method: 'PUT' } }),
    Story: $resource('/api/story/:uid', { uid: '@uid' }, { update: { method: 'PUT' } }),
    Member: $resource('/api/author/:uid', { uid: '@uid' }, { update: { method: 'PUT' } })
  };
});
