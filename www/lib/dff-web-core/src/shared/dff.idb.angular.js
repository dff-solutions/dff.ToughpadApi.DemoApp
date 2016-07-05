    /**
     * @ngdoc service
     * @name dffIdbIndexedDBService
     * @description Service to access IndexedDB.
     */
    angular
        .module('dff.idb', [])
        .provider('dffIdbIndexedDBService', function () {
            var dbname = "dff-app";
            var dbversion = 1;
            var upgradeInterceptors = [];

            this.setVersion = function (v) {
                dbversion = v;
            };

            this.setDBName = function (value) {
                dbname = value;
            };

            this.addUpgradeInterceptor = function (upgradeInterceptor) {
                upgradeInterceptors.push(upgradeInterceptor);
            };

            this.$get = function ($log) {
                return new dff.idb.IndexedDBService(dbname, dbversion, upgradeInterceptors, $log);
            };
        });