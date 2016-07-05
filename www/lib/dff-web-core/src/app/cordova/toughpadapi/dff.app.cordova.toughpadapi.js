
/**
 * Packagepay namespace contains all components for using cordova ToughpadApi plugin.
 *
 * @namespace dff/app/cordova/toughpadapi
 *
 */
dff.namespace('dff.app.cordova.toughpadapi');

/**
 * Logs incoming messageges from LApp service.
 *
 * @name IncomingMessageLogger
 * @memberOf dff/app/cordova/toughpadapi
 * @constructor
 *
 * @param {Object} dffLoggingService Instance of dffLoggingService for logging.
 */
dff.define('dff.app.cordova.toughpadapi.BarcodeLogger', function (dffLoggingService) {
    return {
        onRead: function (msg) {
            dffLoggingService.log("toughpadapi - barcode read:", msg);
        }
    };
});

/**
 * Service for interacting with cordova packagepay plugin.
 *
 * @name ToughpadApiService
 * @memberOf dff/app/cordova/toughpadapi
 * @constructor
 *
 * @param {Object} window Window object as closure for Packagepay plugin object.
 * @param {Object} dffLoggingService dffLoggingService for logging.
 * @param {Object} Logtyp Logtype enum.
 * @param {Object[]} barcodeListeners Listeners for barcodes.
 */
dff.define('dff.app.cordova.toughpadapi.ToughpadApiService', function (
    window,
    dffLoggingService,
    Logtype,
    barcodeListeners
) {
    var self = {};

    barcodeListeners = barcodeListeners || [];

    /**
     * Notifies all incoming message listeners with given message.
     *
     * @name notifyBarcodeListener
     * @memberOf dff/app/cordova/toughpadapi.ToughpadApiService
     * @function
     * @instance
     *
     * @param {Object} msg Message to notify listeners with.
     */
    self.notifyBarcodeListener = function (msg) {
        return barcodeListeners
            .reduce(function (prev, cur) {
                return prev
                    .then(function () {
                        return cur.onRead(msg);
                    });
            }, Promise.resolve());
    };

    /**
     * Registers a new listener for incoming messages.
     *
     * @name addBarcodeListener
     * @memberOf dff/app/cordova/toughpadapi.ToughpadApiService
     * @function
     * @instance
     *
     * @param {Object} listener A listener for barcodes.
     *                          Must implement a onRead function.
     */
    self.addBarcodeListener = function (listener) {
        barcodeListeners.push(listener);
    };

    /**
     * Removes a listener for barcodes
     *
     * @name removeBarcodeListener
     * @memberOf dff/app/cordova/toughpadapi.ToughpadApiService
     * @function
     * @instance
     *
     * @param {Object} listener A registered listener for barcodes.
     */
    self.removeBarcodeListener = function (listener) {
        var i = barcodeListeners.indexOf(listener);

        if (i >= 0) {
            barcodeListeners.splice(i, 1);
        }
    };

    /**
     * Starts packagepay service.
     * Registers handler for log events and messages from cordova ToughpadApi plugin.
     *
     * @name startService
     * @memberOf dff/app/cordova/toughpadapi.ToughpadApiService
     * @function
     * @instance
     *
     * @returns {Promise} Promise that resolves when window.ToughpadApi is defined.
     */
    self.startService = function () {
        return new Promise(function (resolve, reject) {
            if (window.ToughpadApi) {
                window.ToughpadApi
                    .onBarcodeRead(function (msg) {
                        self.notifyBarcodeListener(msg);
                    }, function (reason) {
                        dffLoggingService.error(reason);
                    });

                resolve();
            }
            else {
                reject("ToughpadApi plugin not available");
            }
        });
    };

    return self;
});
