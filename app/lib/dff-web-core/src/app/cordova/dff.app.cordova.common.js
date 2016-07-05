
/**
 * @namespace dff/app/cordova/common
 */
dff.namespace('dff.app.cordova.common');

/**
 * Service for common cordova plugin.
 *
 * @name PluginService
 * @memberOf dff/app/cordova/common
 * @constructor
 *
 * @param {Object} window Window object as closure for Packagepay plugin object.
 * @param {Object} dffLoggingService dffLoggingService for logging.
 * @param {Object} Logtyp Logtype enum.
 */
dff.define('dff.app.cordova.common.PluginService', function (window, dffLoggingService, Logtype) {
    var self = {};

    self.startService = function () {
        return new Promise(function (resolve, reject) {
            if (window.CommonPlugin) {
                window.CommonPlugin
                    .onLog(function (log) {
                        var logMessage = 'plugin log (' + log.tag + '):';

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

                resolve();
            }
            else {
                reject('common plugin not available');
            }
        });
    };

    return self;
});