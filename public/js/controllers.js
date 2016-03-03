angular.module('beep.brake.mainCtrl', []).
controller('mainCtrl', function($scope) {
  $scope.submit = function() {
    $scope.username = '';
    $scope.password = '';
  }
})