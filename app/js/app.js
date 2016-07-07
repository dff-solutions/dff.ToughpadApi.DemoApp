// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', [
  'ionic',
  'app.controllers',
  'app.services',
  'dff.log',
  'dff.start',
  'dff.app.cordova.common',
  'dff.app.cordova.toughpadapi'
])

.config(function (dffStartServiceProvider) {
    dffStartServiceProvider.registerService('dffCommonPluginService');
    dffStartServiceProvider.registerService('dffToughpadApiService');
})

.run(function($ionicPlatform, dffStartService, dffLoggingService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    dffStartService
        .start()
        .catch(function (reason) {
            dffLoggingService.error(reason);
        });
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.barcode', {
    url: '/barcode',
    views: {
      'tab-barcode': {
        templateUrl: 'templates/tab-barcode.html',
        controller: 'BarcodeCtrl'
      }
    }
  })

  .state('tab.readers', {
      url: '/readers',
      views: {
        'tab-readers': {
          templateUrl: 'templates/tab-readers.html',
          controller: 'ReadersCtrl'
        }
      }
    })
    .state('tab.reader-detail', {
      url: '/readers/:readerId',
      views: {
        'tab-readers': {
          templateUrl: 'templates/reader-detail.html',
          controller: 'ReaderDetailCtrl'
        }
      }
    })

  // .state('tab.account', {
  //   url: '/account',
  //   views: {
  //     'tab-account': {
  //       templateUrl: 'templates/tab-account.html',
  //       controller: 'AccountCtrl'
  //     }
  //   }
  // })
  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/barcode');

})
;
