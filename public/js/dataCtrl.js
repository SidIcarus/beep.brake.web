angular.module('beep.brake.dataCtrl', []).
controller('dataCtrl', function($scope, $http, $location, $rootScope) {
  init = function() {
  	if ($rootScope.user) {
  		$scope.$parent.loggedIn = true;
  	}
  	$http.get("/api/events").then(function(res) {
  		$scope.events = res;
  	})
  }

  $scope.viewEvent = function(id) {
  	$location.path('/dataView/' + id);
  }

  init();
})