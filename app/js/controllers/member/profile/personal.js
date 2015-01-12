angular.module('app').controller('AuthorPersonal', function($scope, Api) {
  $scope.changePenname = function() {
    $scope.pennameForm.error = '';
    $scope.pennameForm.errorDismissed = false;
    $scope.author.penname = $scope.update.penname;
    $scope.author.$save();
    $scope.update = {};
  };

  $scope.changeEmail = function() {
    $scope.emailForm.error = '';
    $scope.emailForm.errorDismissed = false;
    Api.Member.update({ uid: $scope.author.uid, email: $scope.update.email }, function(member) {
      $scope.$root.author = member;
      $scope.update = {};
    }, function(response) {
      $scope.emailForm.error = _.safe(response, 'data.description', 'An error occurred while updating your email. Please try again later.');
    });
  };

  $scope.checkPassword = function() {
    $scope.passwordForm.newPw.$invalid = false;
    $scope.passwordForm.newPw.$error.length = false;
    $scope.passwordForm.newPw.$error.pattern = false;
    if ($scope.update.newPw.length < 5) {
      $scope.passwordForm.newPw.$error.length = true;
      $scope.passwordForm.newPw.$invalid = true;
      $scope.passwordForm.$invalid = true;
    } else {
      var count = 0;
      count += (/[a-z]/.test($scope.update.newPw) ? 1 : 0);
      count += (/[A-Z]/.test($scope.update.newPw) ? 1 : 0);
      count += (/[0-9]/.test($scope.update.newPw) ? 1 : 0);
      count += (/[^A-Za-z0-9]/.test($scope.update.newPw) ? 1 : 0);
      if (count < 2) {
        $scope.passwordForm.newPw.$error.pattern = true;
        $scope.passwordForm.newPw.$invalid = true;
        $scope.passwordForm.$invalid = true;
      }
    }
  };

  $scope.changePassword = function() {
    $scope.passwordForm.error = '';
    $scope.passwordForm.errorDismissed = '';
    $scope.update.uid = $scope.author.uid;
    Api.Member.update($scope.update, function(member) {
      $scope.update = {};
    }, function(response) {
      $scope.passwordForm.error = _.safe(response, 'data.description', 'An error occurred while updating your password. Please try again later.');
    });
  };
});
