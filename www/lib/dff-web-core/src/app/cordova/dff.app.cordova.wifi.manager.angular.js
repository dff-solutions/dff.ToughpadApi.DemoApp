
angular
    .module('dff.app.cordova.wifi.manager', ['dff.log'])
    .factory('dffWifiStateLogger', function (dffLoggingService) {
        return new dff.app.cordova.wifi.manager.WifiStateLogger(dffLoggingService);
    })
    .factory('dffNetworkStateLogger', function (dffLoggingService) {
        return new dff.app.cordova.wifi.manager.NetworkStateLogger(dffLoggingService);
    })
    .factory('dffScanResultsLogger', function (dffLoggingService) {
        return new dff.app.cordova.wifi.manager.ScanResultsLogger(dffLoggingService);
    })
    .provider('dffWifiManagerService', function() {
        var networkStateChangeListeners = [];
        var wifiStateChangeListeners = [];
        var scanResultsListeners = [];

        this.addNetworkStateChangeListener = function (listener) {
            networkStateChangeListeners.push(listener);
        };
        this.addWifiStateChangeListener = function (listener) {
            wifiStateChangeListeners.push(listener);
        };
        this.addScanResultsListener = function (listener) {
            scanResultsListeners.push(listener);
        };

        this.$get = function ($injector, $window, dffLoggingService) {
            var nscl = [];
            var wscl = [];
            var srl  = [];

            networkStateChangeListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        nscl.push($injector.get(listener));
                    }
                    else {
                        nscl.push(listener);
                    }
                });

            wifiStateChangeListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        wscl.push($injector.get(listener));
                    }
                    else {
                        wscl.push(listener);
                    }
                });

            scanResultsListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        srl.push($injector.get(listener));
                    }
                    else {
                        srl.push(listener);
                    }
                });

            return new dff.app.cordova.wifi.manager.Service($window, dffLoggingService, nscl, wscl, srl);
        };
    });