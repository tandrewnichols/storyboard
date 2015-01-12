angular.module('app').controller('World', function($scope, Api, $stateParams) {
  $scope.world = _.find($scope.$root.author.worlds, { slug: $stateParams.slug }); 
});
