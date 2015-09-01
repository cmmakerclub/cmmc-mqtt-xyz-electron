angular.module('OfflineViewer.controllers', [])
 
 
.controller('HeaderCtrl', ['$scope', '$mdSidenav', '$rootScope', function($scope, $mdSidenav, $rootScope) {
	$scope.status = $rootScope.onLine; // True: Online | False: Offline
 
	$scope.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	};
 
	$scope.$on('viewer-online', function() {
		$scope.status = true;
		$scope.$apply();
	});
 
	$scope.$on('viewer-offline', function() {
		$scope.status = false;
		$scope.$apply();
	});
}])
 
.controller('AppCtrl', ['$scope', '$mdDialog', '$rootScope', '$window',
	function($scope, $mdDialog, $rootScope, $window) {
		// recheck again.. sometimes eventhough the wifi
		// is disconnected, the navigator thinks it is online!
 
		 console.log("APP CTR");
		 $scope.ready = "OK";
		$scope.status = $rootScope.onLine = $window.navigator.onLine;
 
		$scope.posts = [];
 
		if (!$rootScope.onLine) {
			$mdDialog.show(
				$mdDialog.alert()
				.parent(angular.element(document.body))
				.title('You are offline!')
				.content('I have noticed that you are offline, I need internet access for a while to download the posts. If you do not see any posts after sometime, launch the viewer after connecting to the internet. Prior saved posts will be accessible from the menu. ')
				.ariaLabel('You are offline')
				.ok('Got it!')
			);
		}

		$scope.showPost = function(post) {
			$scope.post = post.content;
		}
 
		$scope.openExternal = function(url) {
			var confirm = $mdDialog.confirm()
				.parent(angular.element(document.body))
				.title('Open the link?')
				.content('Are you sure you want to open ' + url)
				.ok('Yeah! Sure!')
				.cancel('No Thanks!')
 
			$mdDialog.show(confirm).then(function() {
				require('shell').openExternal(url);
			}, function() {
				// noop
			});
		}
 
		$scope.$on('viewer-online', function() {
			$scope.status = true;
			$socket.emit('load', $scope.status);
			$scope.$apply();
		});
 
		$scope.$on('viewer-offline', function() {
			$scope.status = false;
			$scope.$apply();
		});
 
 
		$scope.$on('showSearchPost', function($event, post) {
			$scope.showPost(post);
		});
	}
])
