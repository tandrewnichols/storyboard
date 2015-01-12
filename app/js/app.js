angular.module('app', ['ngResource', 'ui.router', 'ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap']).run(function($rootScope, $state, Redirect) {
  $rootScope.state = $state;
  _.mixin(_.string);
  _.mixin(_._safe);
  _.mixin(_._mixins);

  $rootScope.patterns = {
    email: /^([a-zA-Z0-9_\.\-+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/
  };

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (toState.access === 'member' && !$rootScope.author) {
      Redirect.to = {
        state: toState,
        params: fromParams
      };
      Redirect.waitFor = 'member.login';
      event.preventDefault();
      $state.go('member.login');
    } else if (Redirect.to.state && fromState.name === Redirect.waitFor) {
      delete Redirect.waitFor;
      $state.go(Redirect.to.state.name, Redirect.to.params || {});
      Redirect.to = {};
    }
  });
});
