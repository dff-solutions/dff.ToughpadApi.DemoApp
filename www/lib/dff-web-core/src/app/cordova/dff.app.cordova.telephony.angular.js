
angular
    .module('dff.app.cordova.telephony', ['dff.log'])
    .provider('dffTelephonyService', function () {
        var onCallStateChangedListeners = [];
        var callprefix = "";

        this.addCallStateChangedListener = function (listener) {
            onCallStateChangedListeners.push(listener);
        };

        this.setCallprefix = function (prefix) {
            callprefix = prefix;
        };

        this.$get = function($injector, $window, Logtype, dffLoggingService) {
            var cscls = [];

            onCallStateChangedListeners.forEach(function (listener) {
                if (typeof listener === "string") {
                    cscls.push($injector.get(listener));
                }
                else {
                    cscls.push(listener);
                }
            });

            return new dff.app.cordova.telephony.TelephonyService($window, Logtype, dffLoggingService, cscls, callprefix);
        };
    });
