angular.module('beep.brake.regCtrl', ['ngStorage']).
controller('regCtrl', function($scope, $http, $location, $sessionStorage) {
  $scope.newUser = {};
  $scope.newUser.role = 'user';
  init = function() {
    if (!$sessionStorage.user) {
      $location.url('/');
      return;
    }
    if ($sessionStorage.user.role == 'admin') {
      $scope.$parent.loggedIn = true;
    }
  	$http.get("/web/api/users").then(function(res) {
  		$scope.users = res.data;
  	})
  }

  $scope.register = function() {
    if ($scope.newUser.password != $scope.newUser.confirmPassword) {
      // set an error flag for the user
      $scope.reqFields = true;
      console.log("Fill out all fields");
      return;
    } else {
      hashPass = $scope.newUser.password;
      $http.post('/web/api/register', {
        username: $scope.newUser.username,
        password: hashPass,
        role    : $scope.newUser.role
      })
        .then(function(res) {
          init();
        })
    }
  }

  $scope.delete = function(id) {
    $scope.delFlag = false;
    if ($sessionStorage.user.id == id) {
      //Don't allow admins to delete their own account, flag an error to the user
      $scope.delFlag = true;
      return;
    }
    $http.delete("/web/api/user/" + id).then(function(res) {
      init();
    })
  }

  init();
})