
    angular
        .module('dff.storage', [])
        .factory('dffStorageService', function ($window) {
            return new dff.storage.StorageService($window);
        });
