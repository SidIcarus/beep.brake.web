angular.module('beep.brake.dataCtrl', []).
controller('dataCtrl', function($scope, $http) {
  init = function() {
  	$http.get("/api/events").then(function(res) {
  		$scope.events = res;
  	})
  }

  init();
})