angular.module('app').controller('Login', function($scope, Api) {
  $scope.submit = function() {
    $scope.error = null;
    $scope.dismissed = false;
    if (_.safe($scope, 'member.email') && _.safe($scope, 'member.password')) {
      Api.Member.get($scope.member, function(member) {
        if (member.uid) {
          $scope.$root.author = member;
          $scope.state.go('member.dashboard');
        }
      }, function(response) {
        $scope.error = _.safe(response, 'data.description', 'An error occurred while logging you in. Please try again later.');
      });
    }
  };
});
