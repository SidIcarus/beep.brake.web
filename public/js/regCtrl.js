angular.module('beep.brake.regCtrl', []).
controller('regCtrl', function($scope, $http, $routeParams) {
  $scope.newUser = {};
  init = function() {
  	$http.get("/api/users").then(function(res) {
  		$scope.users   = res.data;
  	})
  }

  $scope.register = function() {
    console.log("Registering....")
    if ($scope.newUser.password != $scope.newUser.confirmPassword) {
      // set an error flag for the user
      return;
    } else {
      //hash password
      hashPass = $scope.newUser.password //.hash
      $http.post('/api/register', {
        username: $scope.newUser.username,
        password: hashPass
      })
        .then(function(res) {
          console.log("Registered User");
          $location.url('dataView');
        })
    }
  }

  init();
})