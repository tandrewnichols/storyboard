angular.module('app').controller('Slug', function($scope) {
  $scope.popover = {
    title: "What is a slug?",
    content: "A slug is a unique identifier for a created entity that will appear in urls for that entity (for instance /dashboard/world/earth). By default, an entity is assigned a slug based on its name, but you can change it, as long as it contains only alphanumeric characters and hyphens and is unique amongst other entities of the same type."
  };
});
