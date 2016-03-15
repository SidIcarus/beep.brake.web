angular.module('beep.brake.regCtrl', []).
controller('regCtrl', function($scope, $http, $location, $rootScope) {
  $scope.newUser = {};
  $scope.newUser.role = 'user';
  init = function() {
  	$http.get("/api/users").then(function(res) {
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
      //hash password
      hashPass = $scope.newUser.password //.hash
      $http.post('/api/register', {
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
    if ($rootScope.user.id == id) {
      //Don't allow admins to delete their own account
      $scope.delFlag = true;
      return;
    }
    $http.delete("/api/user/" + id).then(function(res) {
      init();
    })
  }

  init();
})