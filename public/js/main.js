var app = angular.module('beep.brake', [
	'beep.brake.mainCtrl',
	'beep.brake.dataCtrl',
	'beep.brake.eventCtrl',
	'beep.brake.regCtrl',
	'angularUtils.directives.dirPagination',
	'ngStorage',
	'angularMoment',
	'ngRoute'
	]);

var checkLoggedIn = function($q, $timeout, $http, $location) {
	var deferred = $q.defer();

	$http.get('/loggedin').success(function(user) {
		if (user !== '0') {
			deferred.resolve();
		} else {
			deferred.reject();
			$location.url('/');
		}
	})

	return deferred.promise;
}

var isAdmin = function($location, $sessionStorage) {
	if (!$sessionStorage.user) {
		$location.url('/');
		return;
	}
	if ($sessionStorage.user.role == 'admin') {
		return true;
	} else {
		$location.url('/dataView');
	}
}

app.config(function($httpProvider) { 
	$httpProvider.interceptors.push(function($q, $location) {
		return {
			response: function(res) {
				return res;
			},
			responseError: function(res) {
				if (res.status === 401) {
					$location.url('/');
				return $q.reject(res);
				}
			}
		}
	})
})

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
				loggedin   : checkLoggedIn,
				checkAdmin : isAdmin
			}
		})

		.otherwise({
			redirectTo  : '/'
		})
})

