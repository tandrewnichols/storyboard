angular.module('app').config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
    .state('dashboard.world', {
      url: '/world/:slug?',
      params: {
        slug: '~'
      },
      abstract: true,
      templateUrl: 'world/index.html',
      controller: 'World'
    })
    .state('dashboard.world.summary', {
      url: '/summary',
      templateUrl: 'world/summary.html'
    });
});
