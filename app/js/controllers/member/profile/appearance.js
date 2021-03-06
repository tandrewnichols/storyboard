angular.module('app').controller('AuthorAppearance', function($scope, Api) {
  $scope.submit = function(update) {
    update.uid = $scope.$root.author.uid;
    Api.Author.update(update, function(author) {
      $scope.author = author;
    });
  };
});
