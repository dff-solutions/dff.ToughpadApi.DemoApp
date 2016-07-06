angular
    .module('app.services', [
        'dff.app.cordova.toughpadapi'
    ])
    .factory('BarcodeListener', function($rootScope) {
        var self = {};

        self.onRead = function (data) {
            $rootScope.$apply(function () {
                self.data = data;
            });
        };

        return self;
    })
    .config(function (dffToughpadApiServiceProvider) {
        dffToughpadApiServiceProvider
            .addBarcodeListener("BarcodeListener");
    });
