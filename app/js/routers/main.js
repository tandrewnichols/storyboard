angular.module('app').config(function($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home.html',
      controller: 'Home',
      resolve: {
        hideContainer: function($rootScope) {
          $rootScope.hideContainer = false;
          return true;
        }
      }
    });
});
