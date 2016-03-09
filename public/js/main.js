var app = angular.module('beep.brake', [
	'beep.brake.mainCtrl',
	'beep.brake.dataCtrl',
	'beep.brake.eventCtrl',
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

		.when('/dataView/:id', {
			templateUrl : 'pages/eventView.html',
			controller  : 'eventCtrl'
		})

		.otherwise({
			redirectTo  : '/'
		})
})

