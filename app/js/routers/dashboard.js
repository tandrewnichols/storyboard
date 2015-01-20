angular.module('app').config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'dashboard/index.html',
      controller: 'Dashboard',
      access: 'member'
    });
});
