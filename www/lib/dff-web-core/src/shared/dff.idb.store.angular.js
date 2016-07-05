    angular
    .module('dff.idb.store', ['dff.idb'])
    .provider('dffSettingsStore', function() {
        var name = "Settings";
        var access = "readwrite";

        this.setName = function (n) {
            name = n;
        };

        this.setAccess = function (a) {
            access = a;
        };

        this.$get = function (dffIdbIndexedDBService) {
            return dffIdbIndexedDBService.getObjectStore(name, access);
        };
    })
    .provider('dffDataStore', function() {
        var name = "Data";
        var access = "readwrite";

        this.setName = function (n) {
            name = n;
        };

        this.setAccess = function (a) {
            access = a;
        };

        this.$get = function (dffIdbIndexedDBService) {
            return dffIdbIndexedDBService.getObjectStore(name, access);
        };
    });
