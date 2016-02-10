angular.module('beep.brake.controllers', []).
controller('mainCtrl', function($scope) {
	$scope.test = "Test Text!";

	$scope.submit = function() {
		$scope.username = '';
		$scope.password = '';
	}
})