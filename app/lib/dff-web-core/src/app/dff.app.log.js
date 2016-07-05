
    /**
     * @namespace dff/app/log
     */
    dff.namespace('dff.app.log');

    /**
     * Stores logging messages into Logfile object store.
     *
     * @name LoggingStoreInterceptor
     * @memberOf dff/app/log
     * @constructor
     *
     * @requires dff/log#Logtype
     * @requires dff/log#Logline
     * @requires dff/datetime#DateTimeService
     * @requires dff/app/idb#LogfileStore
     *
     * @param {object} log Log object for exception handling.
     * @param {object} logfileStore Object store to add loglines.
     * @param {boolean} storeDebug Marks if debug messages should be stored.
     */
    dff.define('dff.app.log.LoggingStoreInterceptor', function (log, logfileStore, storeDebug) {
        function addLogToStore(logline) {
            return logfileStore
                .add(logline)
                .catch(function (reason) {
                    log.error('dff.app.log.LoggingStoreInterceptor - error storing logline:', logline, reason);
                });
        }

        this.log = function (logline) {
            // store debug messages only if required
            if (storeDebug || logline.type !== dff.log.Logtype.DEBUG) {
                return addLogToStore(logline);
            }
        };
    });