    /**
     * @namespace dff/log
     */
    dff.namespace('dff.log');

    /**
     * Enumeration for logging types
     * @name Logtype
     * @memberOf dff/log
     * @readOnly
     * @enum {string}
     *
     */
     dff.define('dff.log.Logtype', {
         /** LOG */
         LOG: "LOG",
         DEBUG: "DEBUG",
         INFO: "INFO",
         WARN: "WARN",
         ERROR: "ERROR"
     });

     /**
      * Model for loglines
      *
      * @name Logline
      * @memberOf dff/log
      * @constructor
      *
      * @param {Logtype} type Type of log.
      * @param {Object} content Any serializable content to log.
      * @param {Date} ts Timestamp for logline.
      */
    dff.define('dff.log.Logline', function (type, content, ts) {
        this.type = type;
        this.content = content;
        this.timestamp = ts;
    });

    /**
     * A wrapper to log messages.
     *
     * @name LoggingService
     * @memberOf dff/log
     * @constructor
     *
     * @param {object} log A log object that defines functions for
     * log, debug, info, warn, error.
     * Default is console.
     * @param {Array} interceptors Interceptors that are called to handle logging.
     * @param {Object} DateTimeService Service to get current date for logline timestamp.
     */
    dff.define('dff.log.LoggingService', function (log, interceptors, DateTimeService) {
        this.logObject = log || console;
        this.logInterceptors = interceptors || [];
        this.dateTimeService = DateTimeService;
        this.notificationPromise = Promise.resolve();
    });

    /**
     * Concatenates array values separated by blanks. Calls the toString function of each value.
     *
     * @name concatArgs
     * @memberOf dff/log.LoggingService
     * @function
     * @static
     *
     * @param {Array} args Values to concatenate.
     * @returns {string} Concatenated values.
     */
    dff.log.LoggingService.concatArgs = function (args) {
        var tmpText = "";

        for (var i = 0; i < args.length; i++) {
            if (i > 0) {
                tmpText += " ";
            }

            if (args[i] && typeof args[i].toString() === 'function') {
                tmpText = tmpText.concat(args[i].toString());
            }
            else {
                tmpText += args[i];
            }
        }

        return tmpText;
    };

    /**
     * Adds an interceptor that should be called when a message is logged.
     * @name addInterceptor
     * @memberOf dff/log.LoggingService
     * @function
     * @instance
     *
     * @param {Object} interceptor Interceptorto to call on log
     */
    dff.log.LoggingService.prototype.addInterceptor = function (interceptor) {
        this.logInterceptors.push(interceptor);
    };

    /**
     * Applies all arguments to the log function of the specified log object
     * and notifies all interceptors.
     *
     * @name log
     * @memberOf dff/log.LoggingService
     * @function
     * @instance
     *
     * @return {Promise} A Promise that resolves when all interceptors have finished.
     */
    dff.log.LoggingService.prototype.log = function () {
        this.logObject.log.apply(this.logObject, arguments);
        return this.notifyInterceptors(dff.log.Logtype.LOG, arguments);
    };

    /**
     * Applies all arguments to the info function of the specified log object
     * and notifies all interceptors.
     *
     * @name info
     * @memberOf dff/log.LoggingService
     * @function
     * @instance
     *
     * @return {Promise} A Promise that resolves when all interceptors have finished.
     */
    dff.log.LoggingService.prototype.info = function () {
        this.logObject.info.apply(this.logObject, arguments);
        return this.notifyInterceptors(dff.log.Logtype.INFO, arguments);
    };

    /**
     * Applies all arguments to the debug function of the specified log object
     * and notifies all interceptors.
     *
     * @name debug
     * @memberOf dff/log.LoggingService
     * @function
     * @instance
     *
     * @return {Promise} A Promise that resolves when all interceptors have finished.
     */
    dff.log.LoggingService.prototype.debug = function () {
        this.logObject.debug.apply(this.logObject, arguments);
        return this.notifyInterceptors(dff.log.Logtype.DEBUG, arguments);
    };

    /**
     * Applies all arguments to the warn function of the specified log object
     * and notifies all interceptors.
     *
     * @name warn
     * @memberOf dff/log.LoggingService
     * @function
     * @instance
     *
     * @return {Promise} A Promise that resolves when all interceptors have finished.
     */
    dff.log.LoggingService.prototype.warn = function () {
        this.logObject.warn.apply(this.logObject, arguments);
        return this.notifyInterceptors(dff.log.Logtype.WARN, arguments);
    };

    /**
     * Applies all arguments to the error function of the specified log object
     * and notifies all interceptors.
     *
     * @name error
     * @memberOf dff/log.LoggingService
     * @function
     * @instance
     *
     * @return {Promise} A Promise that resolves when all interceptors have finished.
     */
    dff.log.LoggingService.prototype.error = function () {
        this.logObject.error.apply(this.logObject, arguments);
        return this.notifyInterceptors(dff.log.Logtype.ERROR, arguments);
    };

    /**
     * Notifies all interceptors with a new logline. Interceptors are chained by promises.
     *
     * @name notifyInterceptors
     * @memberOf dff/log.LoggingService
     * @function
     * @instance
     *
     * @param {dff.log.Logtype} type Tpe of log
     * @param args Arguments passed to log function.
     * @returns {Promise} Promise thats resolves when all interceptors are finished.
     */
    dff.log.LoggingService.prototype.notifyInterceptors = function (type, args) {
        var self = this;
        var content = dff.log.LoggingService.concatArgs(args);
        var timestamp = this.dateTimeService.getDate();

        var logline = new dff.log.Logline(type, content, timestamp);

        this.notificationPromise = this.notificationPromise
            .then(function () {
                return self.logInterceptors.reduce(function (prev, cur) {
                    return prev
                        .then(function () {
                            return cur.log(logline);
                        });
                }, Promise.resolve("reduce interceptors"));
            });

        return this.notificationPromise;
    };
