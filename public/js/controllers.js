angular.module('beep.brake.controllers', []).
controller('mainCtrl', function($scope, $http) {
  $scope.submit = function() {
    $scope.username = '';
    $scope.password = '';
  }

  init = function() {
  	$http.get("/api/events").then(function(res) {
  		$scope.events = res;
  	})
  }

  init();
})