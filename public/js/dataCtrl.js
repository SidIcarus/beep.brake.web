angular.module('beep.brake.dataCtrl', ['ngStorage']).
controller('dataCtrl', function($scope, $http, $location, $rootScope, $sessionStorage, moment) {

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
  		$scope.events = res.data;
      angular.forEach($scope.events, function(item, info) {
        if (item.timezone) {
          ndate = moment(item.eventdate).tz(item.timezone).format();
        } else { 
          ndate = moment(item.eventdate).format();
        }
        console.log(typeof(ndate));
        dateArray = ndate.split('T');
        item.date = dateArray[0]
        item.time = dateArray[1]
      });
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

  $scope.viewEvent = function(id, timezone) {
    $scope.$parent.tz = timezone;
  	$location.path('/dataView/' + id);
  }

  init();
})