angular.module('beep.brake.eventCtrl', []).
controller('eventCtrl', function($scope, $http, $routeParams, $rootScope) {
  $scope.currentSegData = []
  $scope.loggedIn = $rootScope.user;
  init = function() {
  	$http.get("/api/event/" + $routeParams.id).then(function(res) {
  		$scope.segments   = res.data.segments;
  		$scope.sensorData = res.data.sensordata;
  	})
  }

  $scope.segSelect = function(id) {
  	$scope.currentSegData = []
  	angular.forEach($scope.sensorData, function(data, info){
  		if (data.segid == id) {
  			$scope.currentSegData.push(data);
  		}
  	})
  }

  init();
})