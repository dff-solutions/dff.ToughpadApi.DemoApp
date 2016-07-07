angular
    .module('app.controllers', [])

    .controller('BarcodeCtrl', function($scope, BarcodeListener) {
        $scope.BarcodeListener = BarcodeListener;
    })

    .controller('ReadersCtrl', function($scope, Readers) {
        $scope.Readers = Readers;

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        $scope.$on('$ionicView.enter', function(e) {
            Readers.getReaders();
        });
    })

    .controller('ReaderDetailCtrl', function($scope, $stateParams, Readers) {
        $scope.$on('$ionicView.enter', function(e) {
            $scope.reader = Readers.get($stateParams.readerId);
        });
    })

    .controller('AccountCtrl', function($scope) {
        $scope.settings = {
          enableFriends: true
        };
    })

;
