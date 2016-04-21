angular.module('beep.brake.eventCtrl', []).
controller('eventCtrl', function($scope, $http, $routeParams, $rootScope) {
  $scope.currentSegData = []
  $scope.loggedIn = $rootScope.user;
  $scope.currentSelection = 0;
  timezone = $routeParams.tz;

  $scope.keys = [];
  $scope.keys.push({ code: 13, action: function() { $scope.open( $scope.focusIndex ); }});
  $scope.keys.push({ code: 38, action: function() { $scope.currentIndex--, $scope.segSelect($scope.currentIndex--); }});
  $scope.keys.push({ code: 40, action: function() { $scope.currentIndex++; $scope.segSelect($scope.currentIndex++); }});
  
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
    //search $scope.segments for the index via id?
    if ((id - $scope.segments[0].id) >= $scope.segments.length) {
      return;
    }
    $scope.currentIndex = id;
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

  $scope.$on('keydown', function( msg, obj ) {
    var code = obj.code;
    $scope.keys.forEach(function(o) {
      if ( o.code !== code ) { return; }
      o.action();
      $scope.$apply();
    });
  });

  init();
})