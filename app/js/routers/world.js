angular.module('app').config(function($urlRouterProvider, $stateProvider) {
  $urlRouterProvider.when('/world/:slug', '/world/:slug/details');
  $stateProvider
    .state('world', {
      url: '/world/:slug',
      abstract: true,
      templateUrl: 'world/index.html',
      controller: 'World',
      resolve: {
        hideContainer: function($rootScope) {
          $rootScope.hideContainer = true;
          return true;
        }
      }
    })
    .state('world.details', {
      url: '/details',
      templateUrl: 'world/details.html',
      controller: 'WorldDetails'
    })
    .state('world.characters', {
      url: '/characters',
      templateUrl: 'world/characters.html',
      controller: 'WorldCharacter'
    })
    .state('world.magic', {
      url: '/magic',
      templateUrl: 'world/magic.html',
      controller: 'WorldMagic'
    })
    .state('world.events', {
      url: '/events',
      templateUrl: 'world/events.html',
      controller: 'WorldEvent'
    })
    .state('world.items', {
      url: '/items',
      templateUrl: 'world/items.html',
      controller: 'WorldItem'
    })
    .state('world.locations', {
      url: '/locations',
      templateUrl: 'world/locations.html',
      controller: 'WorldLocation'
    })
    .state('world.ideas', {
      url: '/ideas',
      templateUrl: 'world/ideas.html',
      controller: 'WorldIdea'
    });
});
