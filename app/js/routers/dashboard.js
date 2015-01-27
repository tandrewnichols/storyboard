angular.module('app').config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'dashboard/index.html',
      controller: 'Dashboard',
      access: 'member',
      resolve: {
        entities: function(Api) {
          return Api.Author.fetch({ type: 'entity', limit: 0 }).$promise;
        }
      }
    });
});
