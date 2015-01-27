angular.module('app').controller('World', function($scope, Api, $stateParams) {
  if ($stateParams.slug !== '~') {
    $scope.world = _.find($scope.$root.author.worlds, { slug: $stateParams.slug }); 
  } else {
    $scope.world = {};
    $scope.isNew = true;
  }
  $scope.edit = angular.copy($scope.world);

  $scope.save = function() {
    Api.World.save($scope.edit, function(world) {
      $scope.worlds.push(world);
      $scope.world = world;
      $scope.edit = angular.copy($scope.world);
    });
  };

  $scope.update = function() {
    var diff = _.extractDiff($scope.edit, $scope.world);
    diff.uid = $scope.world.uid;
    Api.World.update(diff, function(world) {
      $scope.world = world;
      $scope.edit = angular.copy($scope.world);
    }, function(response) {
      $scope.error = response.data.description;  
    });
  };

  $scope.remove = function(world) {
    Api.World.remove({ uid: world.uid }, function() {
      console.log(arguments);  
    });
  };

  $scope.reset = function() {
    $scope.edit = angular.copy($scope.world);
  };
});
