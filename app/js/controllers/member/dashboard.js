angular.module('app').controller('Dashboard', function($scope, Api) {
  $scope.saveWorld = function() {
    $scope.newWorldForm.error = '';
    $scope.newWorldForm.errorDismissed = false;
    Api.World.save($scope.world, function(world) {
      $scope.state.go('world', { slug: world.slug });
    }, function(response) {
      $scope.newWorldForm.error = _.safe(response, 'data.description', 'An error occurred while creating this world. Please try again later.');
    });
  };

  $scope.saveStory = function() {
    $scope.newStoryForm.error = '';
    $scope.newStoryForm.errorDismissed = false;
    $scope.story.world = 'Earth';
    Api.Story.save($scope.story, function(story) {
      $scope.state.go('story', { slug: story.slug });
    }, function(response) {
      $scope.newStoryForm.error = _.safe(response, 'data.description', 'An error occurred while creating this story. Please try again later.');
    });
  };
});
