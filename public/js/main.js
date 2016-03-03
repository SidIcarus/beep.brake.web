var app = angular.module('beep.brake', [
	'beep.brake.mainCtrl',
	'beep.brake.dataCtrl',
	'ngRoute'
	]);

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'pages/login.html',
			controller  : 'mainCtrl'
		})

		.when('/dataView', {
			templateUrl : 'pages/dataView.html',
			controller  : 'dataCtrl'
		})

		.otherwise({
			redirectTo  : '/'
		})
})

