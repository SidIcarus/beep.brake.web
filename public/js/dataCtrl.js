angular.module('beep.brake.dataCtrl', ['ngStorage']).
controller('dataCtrl', function($scope, $http, $location, $rootScope, $sessionStorage) {

  $scope.sortBy = 'eventdate';
  $scope.sortReverse = true;

  init = function() {
    if (!$sessionStorage.user) {
      $location.url('/');
      return;
    }
  	if ($sessionStorage.user.role == 'admin') {
  		$scope.$parent.loggedIn = true;
  	}
  	$http.get("/web/api/events").then(function(res) {
  		$scope.events = res;
  	})
  }

  $scope.changeSort = function(type) {
    $scope.sortBy = type;
    if ($scope.sortReverse == true) {
      $scope.sortReverse = false;
    } else {
      $scope.sortReverse = true;
    }
  }

  $scope.viewEvent = function(id) {
  	$location.path('/dataView/' + id);
  }

  init();
})