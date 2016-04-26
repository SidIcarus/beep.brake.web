angular.module('beep.brake.eventCtrl', []).
controller('eventCtrl', function($scope, $http, $routeParams, $rootScope) {
  $scope.currentSegData = []
  $scope.loggedIn = $rootScope.user;
  currentSelection = 0;
  timezone = $routeParams.tz;

  $scope.keys = [];
  $scope.keys.push({ code: 13, action: function() { $scope.open( $scope.focusIndex ); }});
  $scope.keys.push({ code: 38, action: function() { subIndex(); }});
  $scope.keys.push({ code: 40, action: function() { addIndex(); }});
  
  subIndex = function() {
    if (currentSelection > 0) {
      currentSelection--;
      $scope.segSelectIndex(currentSelection);  
    }
  }

  addIndex = function() {
    if (currentSelection < $scope.segments.length -1) {
      currentSelection++;
      $scope.segSelectIndex(currentSelection);
    }
  }

  init = function() {
  	$http.get("/web/api/event/" + $routeParams.id).then(function(res) {
  		$scope.segments   = res.data.segments;
      $scope.segments.forEach(function(seg) {
        seg.segtime = moment(seg.segtime).tz(timezone).format('HH:mm:ss:SSS ZZ');
      })
  		$scope.sensorData = res.data.sensordata;
  	})
  }

  $scope.segSelectIndex = function(index) {
    $scope.segments.forEach(function(seg, key) {
      if (key == currentSelection) {
        seg.active = true;
      } else {
        seg.active = false;
      }

      getSegmentData();
    })
  }

  $scope.segSelectId = function(id) {
    $scope.segments.forEach(function(seg, key) {
      if (seg.id == id) {
        seg.active = true;
        currentSelection = key;
      } else {
        seg.active = false;
      }
    })

    if ((id - $scope.segments[0].id) >= $scope.segments.length) {
      console.log("ERROR OF SOME KIND?");
      return;
    }

    getSegmentData();

  }

  getSegmentData = function() {
    $scope.currentSegData = [];
    angular.forEach($scope.sensorData, function(data) {
      if (data.segid == $scope.segments[currentSelection].id) {
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