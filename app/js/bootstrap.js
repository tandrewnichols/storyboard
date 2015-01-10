angular.element(document).ready(function() {
  var wait = function() {
    if (window.author || window.authorError) {
      angular.module('app').run(function($rootScope) {
        $rootScope.author = window.author;
        $rootScope.authorError = authorError;
      });
      angular.bootstrap(document, ['app']);
    } else {
      setTimeout(wait, 100);
    }
  };
  wait();
});
