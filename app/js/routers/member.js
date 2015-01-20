angular.module('app').config(function($urlRouterProvider, $stateProvider) {
  $urlRouterProvider.when('/profile', '/profile/personal');
  $stateProvider
    .state('member', {
      url: '',
      abstract: true,
      template: '<ui-view/>'
    })
    .state('member.join', {
      url: '/join',
      templateUrl: 'member/join.html',
      controller: 'Join'
    })
    .state('member.login', {
      url: '/login',
      templateUrl: 'member/login.html',
      controller: 'Login'
    })
    .state('member.profile', {
      url: '/profile',
      abstract: true,
      templateUrl: 'member/profile/index.html',
      controller: 'AuthorProfile',
      access: 'member'
    })
    .state('member.profile.personal', {
      url: '/personal',
      templateUrl: 'member/profile/personal.html',
      controller: 'AuthorPersonal'
    })
    .state('member.profile.appearance', {
      url: '/appearance',
      templateUrl: 'member/profile/appearance.html',
      controller: 'AuthorAppearance'
    })
});
