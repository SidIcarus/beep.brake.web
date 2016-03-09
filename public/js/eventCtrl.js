angular.module('beep.brake.eventCtrl', []).
controller('eventCtrl', function($scope, $http, $routeParams) {
  $scope.currentSegData = []
  init = function() {
  	$http.get("/api/event/" + $routeParams.id).then(function(res) {
  		$scope.segments   = res.data.segments;
  		$scope.sensorData = res.data.sensordata;
  	})
  }

  $scope.segSelect = function(id) {
  	$scope.currentSegData = []
  	angular.forEach($scope.sensorData, function(data, info){
  		console.log(data);
  		if (data.segid == id) {
  			$scope.currentSegData.push(data);
  		}
  	})
/*
  	for (item in $scope.sensorData) {
  		console.log(item);
  		if (item.segid = id) {
  			$scope.currentSegData.push(item);
  		}
  	}
*/
  }

  init();
})