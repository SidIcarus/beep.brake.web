angular.module('beep.brake.eventCtrl', []).
controller('eventCtrl', function($scope, $http, $routeParams, $rootScope) {
  $scope.currentSegData = []
  $scope.loggedIn = $rootScope.user;
  timezone = $routeParams.tz;
  
  init = function() {
  	$http.get("/web/api/event/" + $routeParams.id).then(function(res) {
  		$scope.segments   = res.data.segments;
      $scope.segments.forEach(function(seg) {
        seg.segtime = moment(seg.segtime).tz(timezone).format('HH:mm:ss:SSS ZZ');
      })
  		$scope.sensorData = res.data.sensordata;
  	})
  }

  $scope.segSelect = function(id) {
  	$scope.currentSegData = []
  	angular.forEach($scope.sensorData, function(data, info){
  		if (data.segid == id) {
  			$scope.currentSegData.push(data);
        if (data.key == 'imagename') {
          $scope.img_url = "./events/" + $routeParams.id + "/" + data.value;
        }
  		}
  	})
  }

  init();
})