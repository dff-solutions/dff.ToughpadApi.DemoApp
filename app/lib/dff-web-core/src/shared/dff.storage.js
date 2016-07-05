    dff.namespace('dff.storage');

    dff.define('dff.storage.StorageService', function (window) {
        var self = {};

        self.getStorageInfo = function () {
            var tsp = new Promise(function (resolve, reject) {
                window.navigator.webkitTemporaryStorage.queryUsageAndQuota (
                    function(usedBytes, grantedBytes) {
                        resolve({ used: usedBytes, granted: grantedBytes});
                    },
                    function(reason) {
                        reject(reason);
                    }
                );
            });

            var psp = new Promise(function (resolve, reject) {
                window.navigator.webkitPersistentStorage.queryUsageAndQuota (
                    function(usedBytes, grantedBytes) {
                        resolve({ used: usedBytes, granted: grantedBytes});
                    },
                    function(reason) {
                        reject(reason);
                    }
                );
            });

            return Promise.all([tsp, psp]);
        };

        return self;
    });
