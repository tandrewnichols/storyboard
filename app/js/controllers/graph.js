angular.module('app').controller('Graph', function($scope, $http) {
  $scope.labels = ['All'];
  $scope.getLabels = function() {
    $http.get('/api/admin/labels').then(function(result) {
      $scope.labels = $scope.labels.concat(result.data);
    }, function(response) {
      $scope.error = response.data.description.message;
    });
  };

  $scope.dump = function() {
    $http['delete']('/api/admin/nodes' + (!$scope.selected || $scope.selected === 'All' ? '' : '/' + $scope.selected)).then(function(result) {
      $scope.success = 'Successfully deleted all ' + $scope.selected + ' nodes.';
    }, function(response) {
      $scope.error = response.data.description.message;
    });
  };
});
