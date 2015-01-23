angular.module('app').controller('Story', function($scope, Api) {
  $scope.story = _.find($scope.$root.author.stories, { slug: $stateParams.slug }); 
  $scope.edit = angular.copy($scope.story);

  $scope.update = function() {
    var diff = _.extractDiff($scope.edit, $scope.story);
    diff.uid = $scope.story.uid;
    Api.Story.update(diff, function(story) {
      $scope.story = story;
      $scope.edit = angular.copy($scope.story);
    }, function(response) {
      $scope.error = response.data.description;  
    });
  };

  $scope.reset = function() {
    $scope.edit = angular.copy($scope.story);
  };
});
