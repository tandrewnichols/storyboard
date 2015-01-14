angular.module('app').controller('Join', function($scope, Api) {
  $scope.submit = function() {
    $scope.error = null;
    $scope.dismissed = false;
    if (_.safe($scope, 'member.penname') && _.safe($scope, 'member.email') && _.safe($scope, 'member.password') && _.safe($scope, 'member.confirm')) {
      Api.Member.save($scope.member, function(member) {
        if (member.uid) {
          $scope.$root.author = member; 
          $scope.state.go('member.dashboard');
        }
      }, function(response) {
        $scope.error = $scope.isDev ? response : 'An error occurred while creating your account. Please try again later.';
      }); 
    }
  };

  $scope.checkEmail = function() {
    if ($scope.member && $scope.member.email) {
      Api.Member.get({ email: $scope.member.email }, function(member) {
        $scope.registerForm.email.$error.taken = Boolean(member.uid);
      }, function(response) {
        if (response.status === 409) {
          $scope.registerForm.email.$error.taken = true;
        }
      });
    }
  };

  $scope.checkPassword = function() {
    $scope.registerForm.password.$invalid = false;
    $scope.registerForm.password.$error.length = false;
    $scope.registerForm.password.$error.pattern = false;
    if ($scope.member && $scope.member.password) {
      if ($scope.member.password.length < 5) {
        $scope.registerForm.password.$error.length = true;
        $scope.registerForm.password.$invalid = true;
        $scope.registerForm.$invalid = true;
      } else {
        var count = 0;
        count += (/[a-z]/.test($scope.member.password) ? 1 : 0);
        count += (/[A-Z]/.test($scope.member.password) ? 1 : 0);
        count += (/[0-9]/.test($scope.member.password) ? 1 : 0);
        count += (/[^A-Za-z0-9]/.test($scope.member.password) ? 1 : 0);
        if (count < 2) {
          $scope.registerForm.password.$error.pattern = true;
          $scope.registerForm.password.$invalid = true;
          $scope.registerForm.$invalid = true;
        }
      }
    }
  };
});
