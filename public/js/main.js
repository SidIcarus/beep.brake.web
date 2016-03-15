var app = angular.module('beep.brake', [
	'beep.brake.mainCtrl',
	'beep.brake.dataCtrl',
	'beep.brake.eventCtrl',
	'beep.brake.regCtrl',
	'ngRoute'
	]);

var checkLoggedIn = function($http, $location, $rootScope) {
	if ($rootScope.user) {
		return true;
	} else {
		$location.url('/');
	}
}

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'pages/login.html',
			controller  : 'mainCtrl'
		})

		.when('/dataView', {
			templateUrl : 'pages/dataView.html',
			controller  : 'dataCtrl',
			resolve     : {	
				loggedin : checkLoggedIn
			}
		})

		.when('/dataView/:id', {
			templateUrl : 'pages/eventView.html',
			controller  : 'eventCtrl',
			resolve     : {	
				loggedin : checkLoggedIn
			}
		})
		
		.when('/newUser/', {
			templateUrl : 'pages/register.html',
			controller  : 'regCtrl',
			resolve     : {
				loggedin: checkLoggedIn
			}
		})

		.otherwise({
			redirectTo  : '/'
		})
})

