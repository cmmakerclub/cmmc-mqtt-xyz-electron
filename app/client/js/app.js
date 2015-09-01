// // download socket.io/socket.io.js via JS, as we do not know the port
// var socketScript = document.createElement('script');
// socketScript.setAttribute('type', 'text/javascript');
// socketScript.setAttribute('src', 'http://localhost:' + window.serverPort + '/socket.io/socket.io.js');
// document.getElementsByTagName('head').item(0).appendChild(socketScript);
 
// // wait for the socket.io.js to be downloaded
// // then  bootstrap Angular Manually
// // 			-> We need socket.io right from the word go!
 
// socketScript.onload = function() {
// }
 
angular.module('OfflineViewer', ['ngMaterial', 'ngRoute',  'OfflineViewer.controllers'])
 
.config(['$routeProvider', '$mdThemingProvider',
        function($routeProvider, $mdThemingProvider) {
        	console.log("PV")
 
            // $socketProvider.setConnectionUrl('http://localhost:' + window.serverPort);
 
            $mdThemingProvider.theme('default')
                .primaryPalette('red')
                .accentPalette('orange');
 
            $routeProvider
                .when('/', {
                    templateUrl: 'app/client/templates/App.html',
                    controller: 'AppCtrl'
                })
 
            .otherwise({
                redirectTo: '/'
            });
        }
    ])
    .run(['$rootScope', '$window', function($rootScope, $window) {
 
        $rootScope.inProgress = true;
 
        $rootScope.onLine = $window.navigator.onLine;
 
        $window.addEventListener('online', function() {
            $rootScope.onLine = true;
            $rootScope.$broadcast('viewer-online');
            console.log("ONLINE");
        });
 
        $window.addEventListener('offline', function() {
            $rootScope.onLine = false;
            $rootScope.$broadcast('viewer-offline');
        });
 
    }])
    angular.bootstrap(document, ["OfflineViewer"]);
