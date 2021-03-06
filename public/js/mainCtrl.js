angular.module('beep.brake.mainCtrl', ['ngStorage']).
controller('mainCtrl', function($scope, $http, $location, $rootScope, $sessionStorage) {
  $scope.user = {};
  $scope.user.username = '';
  $scope.user.password = '';
  $scope.loggedIn = false;

  $scope.submit = function() {
    if ($scope.user.username != '' && $scope.user.password != '') {
      $scope.errFlag = false;
      $http.post('/login', {
        username: $scope.user.username.toLowerCase(), 
        password: $scope.user.password
      })
        .then(function(res){
          $sessionStorage.user = (res.data);
          $location.url('dataView');
        },
        function(err) {
          $scope.errFlag = true;
          return;
        });
      }
  }

  $scope.logout = function() {
    $http.post('/logout')
    delete $sessionStorage.user;
    $scope.loggedIn = false;
    $location.url('/');
  }
})