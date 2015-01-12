angular.module('app').controller('WorldDetails', function($scope, Api) {
  $scope.edit = angular.copy($scope.world);

  $scope.update = function() {
    var diff = _.extractDiff($scope.edit, $scope.world);
    diff.uid = $scope.world.uid;
    Api.World.update(diff, function(world) {

    });
  };

  $scope.reset = function() {
    $scope.edit = angular.copy($scope.world);
  };
});
