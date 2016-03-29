angular.module('beep.brake.mainCtrl', []).
controller('mainCtrl', function($scope, $http, $location, $rootScope) {
  $scope.user = {};
  $scope.user.username = '';
  $scope.user.password = '';
  $scope.loggedIn = false;

  $scope.submit = function() {
    if ($scope.user.username != '' && $scope.user.password != '') {
      $scope.errFlag = false;
      //TODO: hash password before sending it
      $http.post('/login', {
        username: $scope.user.username, 
        password: $scope.user.password
      })
        .then(function(res){
          $rootScope.user = (res.data);
          $location.url('dataView');
        },
        function(err) {
          $scope.errFlag = true;
          return;
        });
      }
  }
})