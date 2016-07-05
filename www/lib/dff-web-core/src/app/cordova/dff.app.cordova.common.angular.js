
angular
    .module('dff.app.cordova.common', ['dff.log'])
    .factory('dffCommonPluginService', function ($window, dffLoggingService, Logtype) {
        return new dff.app.cordova.common.PluginService($window, dffLoggingService, Logtype);
    });