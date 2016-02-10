angular.module('beep.brake.controllers', []).
controller('mainCtrl', function($scope) {
	$scope.submit = function() {
		$scope.username = '';
		$scope.password = '';
	}
})