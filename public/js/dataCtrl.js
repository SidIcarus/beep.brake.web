angular.module('beep.brake.dataCtrl', []).
controller('dataCtrl', function($scope, $http, $location) {
  init = function() {
  	$http.get("/api/events").then(function(res) {
  		$scope.events = res;
  	})
  }

  $scope.viewEvent = function(id) {
  	$location.path('/dataView/' + id);
  }

  init();
})