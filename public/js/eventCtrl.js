angular.module('beep.brake.eventCtrl', []).
controller('eventCtrl', function($scope, $http, $routeParams, $rootScope) {
  $scope.currentSegData = []
  $scope.loggedIn = $rootScope.user;
  init = function() {
  	$http.get("/web/api/event/" + $routeParams.id).then(function(res) {
  		$scope.segments   = res.data.segments;
      $scope.segments.forEach(function(seg) {
        seg.segtime = buildDate(new Date(seg.segtime));
      })
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

  function addZero(x,n) {
    while (x.toString().length < n) {
        x = "0" + x;
    }
    return x;
  }

  function buildDate(time) {
      var h = addZero(time.getHours(), 2);
      var m = addZero(time.getMinutes(), 2);
      var s = addZero(time.getSeconds(), 2);
      var ms = addZero(time.getMilliseconds(), 3);
      return (h + ":" + m + ":" + s + ":" + ms);
  } 

  init();
})