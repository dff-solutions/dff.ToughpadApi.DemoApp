
dff.namespace('dff.app.cordova.telephony');

dff.define('dff.app.cordova.telephony.TelephonyService', function (window, Logtype, dffLoggingService, callStateListener, callprefix) {
    var self = {
        telephonyinfo: {}
    };

    callStateListener = callStateListener || [];

    function onDeviceReady() {
        if (window.Telephony) {
            window.Telephony.onCallStateChanged(function (callstate) {
                notifyCallStateListeners(callstate);
            }, function (reason) {
                dffLoggingService.error(reason);
            });
        }
        else {
            dffLoggingService.error("Telephony plugin not available");
        }
    }

    function notifyCallStateListeners (callstate) {
        callStateListener.forEach(function (listener) {
            if (typeof listener.onCallStateChanged === "function") {
                listener.onCallStateChanged(callstate);
            }
            else {
                dffLoggingService.error('TelephonyService notifyCallStateListeners onCallStateChanged missing', listener);
            }
        });
    }

    self.onCallStateChanged = function(listener) {
        callStateListener.push({
            onCallStateChanged: listener
        });
    };

    // e.g. for GSM codes that show/hide caller id.
    // is prepended for all calls
    self.setCallprefix = function (prefix) {
        callprefix = prefix;
    };

    self.getCallprefix = function () {
        return callprefix;
    };

    self.loadTelephonyInfo = function () {
        return new Promise(function (resolve, reject) {
            if (window.Telephony) {
                window.Telephony.telephonyinfo(
                    function (info) {
                        self.telephonyinfo = info;
                        resolve(info);
                    }, function (reason) {
                        self.telephonyinfo = {};
                        reject(reason);
                    }
                );
            }
            else {
                reject("Telephony plugin not available");
            }
        });
    };

    self.loadCallsLog = function () {
        return new Promise(function (resolve, reject) {
            if (window.Telephony) {
                window.Telephony.getCallsLog(function (calllog) {
                    resolve(calllog);
                }, function (reason) {
                    reject(reason);
                });
            }
            else {
                reject("Telephony plugin not available");
            }
        });
    };

    self.clearCallsLog = function (where) {
        return new Promise(function (resolve, reject) {
            if (window.Telephony) {
                if (where && typeof where === 'string') {
                    window.Telephony.clearCalllog(function (deleted) {
                        resolve(deleted);
                    }, function (reason) {
                        reject(reason);
                    }, {
                        where: where
                    });
                }
                else {
                    window.Telephony.clearCalllog(function (deleted) {
                        resolve(deleted);
                    }, function (reason) {
                        reject(reason);
                    }, {});
                }
            }
            else {
                reject("Telephony plugin not available");
            }
        });
    };

    self.call = function (number) {
        return new Promise(function (resolve, reject) {
            if (number) {
                if (typeof callprefix !== "undefined") {
                    number = callprefix + number;
                }

                window.Telephony.call(
                    function () {
                        resolve();
                    },
                    function (reason) {
                        dffLoggingService.error(reason);
                        reject(reason);
                    }, { number: number }
                );
            }
            else {
                reject("no valid number");
            }
        });
    };

    self.startService = function () {
        if (window.Telephony) {
            window.Telephony
                .onLog(function (log) {
                    var logMessage = 'TelephonyService (' + log.tag + '):';

                    switch (log.type) {
                        case Logtype.LOG:
                            dffLoggingService.log(logMessage, log.msg);
                            break;
                        case Logtype.DEBUG:
                            dffLoggingService.debug(logMessage, log.msg);
                            break;
                        case Logtype.INFO:
                            dffLoggingService.info(logMessage, log.msg);
                            break;
                        case Logtype.WARN:
                            dffLoggingService.warn(logMessage, log.msg);
                            break;
                        case Logtype.ERROR:
                            dffLoggingService.error(logMessage, log.msg, log.tr, log.stackTrace);
                            break;
                        }
                }, function (reason) {
                    dffLoggingService.error(reason);
                });
        }

        return self.loadTelephonyInfo();
    };

    window.document.addEventListener("deviceready", onDeviceReady, false);

    return self;
});
