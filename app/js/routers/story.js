angular.module('app').config(function($stateProvider) {
  $stateProvider
    .state('story', {
      url: '/story/:slug',
      abstract: true,
      templateUrl: 'story/index.html',
      controller: 'Story',
      resolve: {
        hideContainer: function($rootScope) {
          $rootScope.hideContainer = true;
          return true;
        }
      }
    });
});
