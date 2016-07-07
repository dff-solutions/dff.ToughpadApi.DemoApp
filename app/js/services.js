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

        self.clear = function () {
            self.data = undefined;
        };

        return self;
    })
    .factory('Readers', function ($rootScope, dffToughpadApiService) {
        var self = {};

        self.readers = [];

        self.getReaders = function () {
            dffToughpadApiService
                .getBarcodeReaders()
                .then(function (readers) {
                    $rootScope.$apply(function () {
                        self.readers = readers || [];
                    });
                });
        };

        self.get = function (readerID) {
            return self.readers[readerID];
        };

        return self;
    })
    .config(function (dffToughpadApiServiceProvider) {
        dffToughpadApiServiceProvider
            .addBarcodeListener("BarcodeListener");
    });
