    angular
        .module('dff.app.log', ['dff.app.idb.store'])
        .provider('dffLoggingStoreInterceptor', function () {
            var storeDebug = false;

            this.setStoreDebug = function (sd) {
                storeDebug = !!sd;
            };

            this.$get = function($log, dffLogfileStore) {
                return new dff.app.log.LoggingStoreInterceptor($log, dffLogfileStore, storeDebug);
            };
        });