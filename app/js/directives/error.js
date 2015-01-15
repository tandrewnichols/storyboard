angular.module('app').directive('error', function() {
  return {
    scope: {
      error: '=?error',
      dismissed: '=?dimissed'
    },
    template: function($element, $attributes) {
      return '<div class="alert ' + ($attributes.alertClass || 'alert-danger') + ' alert-dismissable">'
             + '<button class="close" type="button" ng-click="dismissed = true; error = \'\';" aria-hidden="true">&times</button>'
             + '{{ error }}'
           + '</div>';
    }
  };
});
