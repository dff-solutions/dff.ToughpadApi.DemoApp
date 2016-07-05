
angular
    .module('dff.app.cordova.toughpadapi', ['dff.log'])
    .factory('dffToughpadApiBarcodeLogger', function (dffLoggingService) {
        return new dff.app.cordova.toughpadapi.BarcodeLogger(dffLoggingService);
    })
    .provider('dffToughpadApiService', function () {
        var barcodeListeners = [];

        this.addBarcodeListener = function (listener) {
            barcodeListeners.push(listener);
        };

        this.$get = function ($injector, $window, dffLoggingService, Logtype) {
            var bcl = [];

            barcodeListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        bcl.push($injector.get(listener));
                    }
                    else {
                        bcl.push(listener);
                    }
                });

            return new dff.app.cordova.toughpadapi.ToughpadApiService($window, dffLoggingService, Logtype, bcl);
        };
    })
    .config(function (dffToughpadApiServiceProvider) {
        dffToughpadApiServiceProvider.addBarcodeListener("dffToughpadApiBarcodeLogger");
    });
