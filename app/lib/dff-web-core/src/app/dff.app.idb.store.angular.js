
    angular
    .module('dff.app.idb.store', ['dff.idb', 'dff.idb.store'])
    .provider('dffLogfileStore', function() {
        var name = "Logfile";
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
    .provider('dffMessageOutgoingStore', function() {
        var name = "MessageOutgoing";
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
    .provider('dffMessageIncomingStore', function() {
        var name = "MessageIncoming";
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