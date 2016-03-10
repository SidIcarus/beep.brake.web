angular.module('beep.brake.mainCtrl', []).
controller('mainCtrl', function($scope, $http, $location, $rootScope) {
  $scope.user = {};
  $scope.user.username = '';
  $scope.user.password = '';

  $scope.submit = function() {
    if ($scope.user.username != '' && $scope.user.password != '') {
      $http.post('/login', {
        username: $scope.user.username, 
        password: $scope.user.password
      })
        .then(function(res){
          $rootScope.user = (res.data);
          console.log($rootScope.user);
          $location.url('dataView');
        },
        function() {
          console.log("Err");
          //error
        });
      }
  }
})