
/**
 * Packagepay namespace contains all components for using cordova packagepay plugin.
 *
 * @namespace dff/app/packagepay
 * @example
 * var incomingMessageListener = {
 *     onIncomingMessage: function (msg) {
 *         console.log(msg);
 *
 *         switch (msg.what.ordinal) {
 *             case Packagepay.WHAT.EndOfTourResult.ordinal:
 *             case Packagepay.WHAT.Result.ordinal:
 *                 dffPackagepayService.sendGotResult(msg);
 *             break;
 *             case Packagepay.WHAT.Ack.ordinal:
 *                 switch (msg.arg1.ordinal) {
 *                     case Packagepay.WHAT.GotResult.ordinal:
 *                         switch (msg.arg2.ordinal) {
 *                             case Packagepay.WHAT.EndOfTourResult.ordinal:
 *                             case Packagepay.WHAT.Result.ordinal:
 *                             case Packagepay.WHAT.Error.ordinal:
 *                                 console.warn("Handle XML here!");
 *                                 break;
 *                             default:
 *                             break;
 *                         }
 *                     break;
 *                     case Packagepay.WHAT.ListTransactions:
 *                         console.log("transactions:", msg.transactions);
 *                     default:
 *                     break;
 *                 }
 *             break;
 *             default:
 *             break;
 *         }
 *     }
 * };
 *
 * var dffPackagepayService = new dff.app.packagepay.PackagepayService(window, console, dff.log.Logtype, [incomingMessageListener]);
 *
 * dffPackagepayService
 *     .startService()
 *     .then(function () {
 *         var random = Math.round(Math.random() * 1000);
 *         var logistician = new dff.app.packagepay.Logistician("RHD", "Driver", "Driver123", "branch321");
 *         var p1 = new dff.app.packagepay.Package("Forwarder", "123063", "track_" + random, "1.00", "1.00");
 *
 *         p1.customerReferenceNumber = "iSell_"  + random;
 *         p1.endCustomerEmail = "florian.gohlke@lavego.de";
 *         p1.endCustomerPhone = "+49 123 456789";
 *         p1.amountCardMaxOffline = "100.0"; // if no connection
 *
 *         var payment = new dff.app.packagepay.Payment(logistician, p1);
 *
 *         return dffPackagepayService
 *             .sendPayment(payment);
 *     })
 *     .then(function (msg) {
 *         console.log(msg);
 *     });
 *
 * // send end of Tour
 * var endOfTour = new dff.app.packagepay.EndOfTour();
 * dffPackagepayService.sendEndOfTour(endOfTour);
 *
 * // list transactions
 * dffPackagepayService.listTransactions();
 *
 * // with angular components could be injected
 * var dffPackagepayPayment = angular.element(document.body).injector().get("dffPackagepayPayment");
 * var dffPackagepayLogistician = angular.element(document.body).injector().get("dffPackagepayLogistician");
 * var dffPackagepayPackage = angular.element(document.body).injector().get("dffPackagepayPackage");
 * var dffPackagepayEndOfTour = angular.element(document.body).injector().get("dffPackagepayEndOfTour");
 * var dffPackagepayService = angular.element(document.body).injector().get("dffPackagepayService");
 */
dff.namespace('dff.app.packagepay');

/**
 * Cards allowed for PackagePay
 *
 * @memberOf dff/app/packagepay
 * @static
 * @enum {String}
 */
dff.define('dff.app.packagepay.CardType', {
    GIROCARD: "Girocard",
    MAESTRO: "Maestro",
    V_PAY: "VPay",
    MASTER_CARD: "MasterCard",
    VISA: "VISA",
    AMERICAN_EXPRESS: "AmericanExpress",
    DINERS_CLUB: "DinersClub",
    JCB: "JCB",
    UNION_PAY: "UnionPay",
    DISCOVER: "Discover",
    IKEA_FAMILY: "IKEAFamily",
    IKANO: "IKANO",
    UNKNOWN: "Unknown"
});

/**
 * Customer type for packagepay
 *
 * @memberOf dff/app/packagepay
 * @static
 * @enum {String}
 */
dff.define('dff.app.packagepay.CustomerType', {
    FORWARDER: "Forwarder",
    LOGISTICIAN_PARTNER: "LogisticianPartner",
    SHOP: "Shop",
    AUTOMATED_STATION: "AutomatedStation",
    PACKAGE_PAY_PRIVATE: "PackagePayPrivate"
});

/**
 * GirocardProcess
 *
 * @memberOf dff/app/packagepay
 * @static
 * @enum {String}
 */
dff.define('dff.app.packagepay.GirocardProcess', {
    ELECTRONIC_CASH: "ElectronicCash",
    LASTSCHRIFT: "Lastschrift"
});


/**
 * GirocardProcessing
 *
 * @memberOf dff/app/packagepay
 * @static
 * @enum {String}
 */
dff.define('dff.app.packagepay.GirocardProcessing', {
    ELECTRONIC_CASH: "ElectronicCash",
    LASTSCHRIFT_ONLINE: "LastschriftOnline",
    LASTSCHRIFT_ONLINE_FALLBACK_ELECTRONIC_CASH: "LastschriftOnlineFallbackElectronicCash"
});

/**
 * PaymentResult
 *
 * @memberOf dff/app/packagepay
 * @static
 * @enum {String}
 */
dff.define('dff.app.packagepay.PaymentResult', {
    SUCCESS: "Success",
    FAILURE: "Failure",
    COMMUNICATION_ERROR: "CommunicationError"
});

/**
 * ProcessType
 *
 * @memberOf dff/app/packagepay
 * @static
 * @enum {String}
 */
dff.define('dff.app.packagepay.ProcessType', {
    DRIVER: "Driver",
    SHOP: "Shop",
    AUTOMATED_STATION: "AutomatedStation"
});

/**
 * WHAT
 *
 * @memberOf dff/app/packagepay
 * @static
 * @enum {String}
 */
dff.define('dff.app.packagepay.WHAT', {
    "Unknown": {
        "ordinal": 0,
        "name": "Unknown"
    },
    "Result": {
        "ordinal": 1,
        "name": "Result"
    },
    "ResultList": {
        "ordinal": 2,
        "name": "ResultList"
    },
    "Payment": {
        "ordinal": 3,
        "name": "Payment"
    },
    "PaymentList": {
        "ordinal": 4,
        "name": "PaymentList"
    },
    "SetReplyTo": {
        "ordinal": 5,
        "name": "SetReplyTo"
    },
    "UnsetReplyTo": {
        "ordinal": 6,
        "name": "UnsetReplyTo"
    },
    "Ack": {
        "ordinal": 7,
        "name": "Ack"
    },
    "NewPayment": {
        "ordinal": 8,
        "name": "NewPayment"
    },
    "EndOfTourResult": {
        "ordinal": 9,
        "name": "EndOfTourResult"
    },
    "GotResult": {
        "ordinal": 10,
        "name": "GotResult"
    },
    "EndOfTour": {
        "ordinal": 11,
        "name": "EndOfTour"
    },
    "NAck": {
        "ordinal": 12,
        "name": "NAck"
    },
    "UpdateNeeded": {
        "ordinal": 13,
        "name": "UpdateNeeded"
    },
    "EndOfTourSilent": {
        "ordinal": 14,
        "name": "EndOfTourSilent"
    },
    "Error": {
        "ordinal": 15,
        "name": "Error"
    },
    "SuppressFinish": {
        "ordinal": 16,
        "name": "SuppressFinish"
    },
    "ListTransactions": {
        "ordinal": 17,
        "name": "ListTransactions"
    },
    "MustInitial": {
        "ordinal": 18,
        "name": "MustInitial"
    },
    "CancelProgressDialog": {
        "ordinal": 19,
        "name": "CancelProgressDialog"
    },
    "StartProgressDialog": {
        "ordinal": 20,
        "name": "StartProgressDialog"
    },
    "SAppStartsAction": {
        "ordinal": 21,
        "name": "SAppStartsAction"
    },
    "SAppStopsAction": {
        "ordinal": 22,
        "name": "SAppStopsAction"
    },
    "RunningState": {
        "ordinal": 23,
        "name": "RunningState"
    },
    "ResetToDefaults": {
        "ordinal": 24,
        "name": "ResetToDefaults"
    },
    "StartWLAN": {
        "ordinal": 25,
        "name": "StartWLAN"
    },
    "StartSApp": {
        "ordinal": 26,
        "name": "StartSApp"
    }
});

/**
 * VERIFY_ERROR
 *
 * @memberOf dff/app/packagepay
 * @static
 * @enum {String}
 */
dff.define('dff.app.packagepay.VERIFY_ERROR', {
    "UNKNOWN": {
        "ordinal": 0,
        "name": "UNKNOWN"
    },
    "NO_ERROR": {
        "ordinal": 1,
        "name": "NO_ERROR"
    },
    "NO_PACKAGE_PAY_DEFAULTS": {
        "ordinal": 2,
        "name": "NO_PACKAGE_PAY_DEFAULTS"
    },
    "NO_ALLOWED_CARDS": {
        "ordinal": 3,
        "name": "NO_ALLOWED_CARDS"
    },
    "NO_CUSTOMER_TYPE": {
        "ordinal": 4,
        "name": "NO_CUSTOMER_TYPE"
    },
    "NO_CUSTOMER_NUMBER": {
        "ordinal": 5,
        "name": "NO_CUSTOMER_NUMBER"
    },
    "NO_AMOUNT_CARD": {
        "ordinal": 6,
        "name": "NO_AMOUNT_CARD"
    },
    "NO_TRACKING_NUMBER": {
        "ordinal": 7,
        "name": "NO_TRACKING_NUMBER"
    },
    "NO_LOGISTICIAN": {
        "ordinal": 8,
        "name": "NO_LOGISTICIAN"
    },
    "NO_AMOUNT_COD": {
        "ordinal": 9,
        "name": "NO_AMOUNT_COD"
    },
    "DOUBLE_PAYMENT": {
        "ordinal": 10,
        "name": "DOUBLE_PAYMENT"
    },
    "PREVIOUS_PAYMENT_NOT_COMPLETED": {
        "ordinal": 11,
        "name": "PREVIOUS_PAYMENT_NOT_COMPLETED"
    },
    "NO_PACKAGES": {
        "ordinal": 12,
        "name": "NO_PACKAGES"
    },
    "AMOUNT_COD_SMALLER_THAN_AMOUNT_CARD": {
        "ordinal": 13,
        "name": "AMOUNT_COD_SMALLER_THAN_AMOUNT_CARD"
    },
    "PREVIOUS_END_OF_DAY_NOT_COMPLETED": {
        "ordinal": 14,
        "name": "PREVIOUS_END_OF_DAY_NOT_COMPLETED"
    },
    "NO_LOGISTICIAN_BRANCH": {
        "ordinal": 15,
        "name": "NO_LOGISTICIAN_BRANCH"
    },
    "REJECT_WHILE_PROCESSING": {
        "ordinal": 16,
        "name": "REJECT_WHILE_PROCESSING"
    },
    "NO_IP_SET": {
        "ordinal": 17,
        "name": "NO_IP_SET"
    },
    "RECONNECT_SERVICE_AFTER_SAPP_UPDATE": {
        "ordinal": 18,
        "name": "RECONNECT_SERVICE_AFTER_SAPP_UPDATE"
    },
    "MISSING_RECEIPT_SIGNATURE": {
        "ordinal": 19,
        "name": "MISSING_RECEIPT_SIGNATURE"
    },
    "SAPP_NEEDS_UPDATE": {
        "ordinal": 20,
        "name": "SAPP_NEEDS_UPDATE"
    },
    "NO_CONNECTION_TO_PT_START_SAPP": {
        "ordinal": 21,
        "name": "NO_CONNECTION_TO_PT_START_SAPP"
    }
});

/**
 * Represents a payment.
 *
 * @name Payment
 * @memberOf dff/app/packagepay
 * @constructor
 *
 * @param {Logistician} logistician The logistician of thepayment.
 * @param {Package[]} pck A list of packages belonging to the payment.
 */
dff.define('dff.app.packagepay.Payment', function Payment (logistician, pck) {
    this.logistician = logistician;
    this.package = pck;
});

/**
 * Represents a logistician.
 *
 * @name Logistician
 * @memberOf dff/app/packagepay
 * @constructor
 *
 * @param {string} name Name of logistician.
 * @param {string} processType Type of process that is used for delivery of the package.
 * @param {string} ident Ident of logistician.
 * @param {string} branch Number of logistician's branch where the package comes from.
 */
dff.define('dff.app.packagepay.Logistician', function (name, processType, ident, branch) {
    this.name = name;
    this.processType = processType;
    this.ident = ident;
    this.branch = branch;
});

/**
 * Represents an EndOfTour
 *
 * @name EndOfTour
 * @memberOf dff/app/packagepay
 * @constructor
 */
dff.define('dff.app.packagepay.EndOfTour', function () {});

/**
 * Represents a package.
 * Mandatory properties must be provided via constructor.
 * Optional properties can be set afterwards.
 *
 * @name Package
 * @memberOf dff/app/packagepay
 * @constructor
 * @param {string} customerType What kind of customer is processing the payment.
 * @param {string} customerNumber Customer number for payment.
 * @param {string} trackingNumber A clear identification for the package.
 * @param {string} amountCard Amount that has to be paid by card by the end-customer.
 * @param {string} amountCOD Amount the logisitican partner has to take from then end-customer.
 */
dff.define('dff.app.packagepay.Package', function (
    customerType,
    customerNumber,
    trackingNumber,
    amountCard,
    amountCOD
) {
    this.customerType = customerType;
    this.customerNumber = customerNumber;
    this.trackingNumber = trackingNumber;
    this.amountCard = amountCard;
    this.amountCOD = amountCOD;
});

/**
 * Logs incoming messageges from LApp service.
 *
 * @name IncomingMessageLogger
 * @memberOf dff/app/packagepay
 * @constructor
 *
 * @param {Object} dffLoggingService Instance of dffLoggingService for logging.
 */
dff.define('dff.app.packagepay.IncomingMessageLogger', function (dffLoggingService) {
    return {
        onIncomingMessage: function (msg) {
            dffLoggingService.log("Packagepay - incoming message:", msg);
        }
    };
});

/**
 * Logs connection changes from LApp service.
 *
 * @name ServiceConnectionLogger
 * @memberOf dff/app/packagepay
 * @constructor
 *
 * @param {Object} dffLoggingService Instance of dffLoggingService for logging.
 */
dff.define('dff.app.packagepay.ServiceConnectionLogger', function (dffLoggingService) {
    return {
        onServiceConnectionChange: function (connected) {
            dffLoggingService.log("Packagepay - service connected:", connected);
        }
    };
});

/**
 * Service for interacting with cordova packagepay plugin.
 *
 * @name PackagepayService
 * @memberOf dff/app/packagepay
 * @constructor
 *
 * @param {Object} window Window object as closure for Packagepay plugin object.
 * @param {Object} dffLoggingService dffLoggingService for logging.
 * @param {Object} Logtyp Logtype enum.
 * @param {Object[]} incomingMessageListeners Listeners for incoming messages.
 */
dff.define('dff.app.packagepay.PackagepayService', function (
    window,
    dffLoggingService,
    Logtype,
    incomingMessageListeners,
    connectionChangeListeners
) {
    var self = {};

    incomingMessageListeners = incomingMessageListeners || [];
    connectionChangeListeners = connectionChangeListeners || [];

    /**
     * Notifies all incoming message listeners with given message.
     *
     * @name notifyIncomingMessageListener
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param {Object} msg Message to notify listeners with.
     */
    self.notifyIncomingMessageListener = function (msg) {
        return incomingMessageListeners
            .reduce(function (prev, cur) {
                return prev
                    .then(function () {
                        return cur.onIncomingMessage(msg);
                    });
            }, Promise.resolve());
    };

    /**
     * Registers a new listener for incoming messages.
     *
     * @name addIncomingMessageListener
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param {Object} listener A listener for incoming messages.
     *                          Must implement a onIncomingMessage function.
     */
    self.addIncomingMessageListener = function (listener) {
        incomingMessageListeners.push(listener);
    };

    /**
     * Removes a listener for incoming messages.
     *
     * @name removeIncomingMessageListener
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param {Object} listener A registered listener for incoming messages.
     */
    self.removeIncomingMessageListener = function (listener) {
        var i = incomingMessageListeners.indexOf(listener);

        if (i >= 0) {
            incomingMessageListeners.splice(i, 1);
        }
    };

    /**
     * Notifies all service connection change listeners.
     *
     * @name notifyServiceConnectionListener
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param {Object} connected Boolean indicator if service is connected or disconnected.
     */
    self.notifyServiceConnectionListener = function (connected) {
        return connectionChangeListeners
            .reduce(function (prev, cur) {
                return prev
                    .then(function () {
                        return cur.onServiceConnectionChange(connected);
                    });
            }, Promise.resolve());
    };

    /**
     * Registers a new listener for service connection changes.
     *
     * @name addServiceConnectionChangeListener
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param {Object} listener A listener for service connectino changes.
     *                          Must implement a onIncomingMessage function.
     */
    self.addServiceConnectionChangeListener = function (listener) {
        connectionChangeListeners.push(listener);
    };

    /**
     * Removes a listener for service connection changes.
     *
     * @name removeServiceConnectionChangeistener
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param {Object} listener A registered listener for service connection changes.
     */
    self.removeServiceConnectionChangeistener = function (listener) {
        var i = connectionChangeListeners.indexOf(listener);

        if (i >= 0) {
            connectionChangeListeners.splice(i, 1);
        }
    };

    /**
     * Starts packagepay service.
     * Registers handler for log events and messages from cordova packagepay plugin.
     *
     * @name startService
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @returns {Promise} Promise that resolves when window.Packagepay is defined.
     */
    self.startService = function () {
        return new Promise(function (resolve, reject) {
            if (window.Packagepay) {
                window.Packagepay
                    .onIncomingMessage(function (msg) {
                        self.notifyIncomingMessageListener(msg);
                    }, function (reason) {
                        dffLoggingService.error(reason);
                    });

                window.Packagepay
                    .onServiceConnectionChange(function (connected) {
                        self.notifyServiceConnectionListener(connected);
                    }, function (reason) {
                        dffLoggingService.error(reason);
                    });

                resolve();
            }
            else {
                reject("Packagepay plugin not available");
            }
        });
    };

    /**
     * Sends a SAppMessage to LApp service.
     *
     * @name sendReplyTo
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param  {Object} args Arguments for cordova plugin
     * @param {string} args.what What type of message will be send.
     * @param {string} args.arg1 arg1 property of SAppmessage.
     * @param {string} args.arg2 arg2 property of SAppmessage.
     * @param {string} args.xml xml property of SAppmessage.
     * @param {string} args.token Token to identify LApp service messenger communication.
     *
     * @return {Promise} Promise that resolves with send send message.
     */
    self.sendReplyTo = function (args) {
        return new Promise(function (resolve, reject) {
            window.Packagepay
                .sendReplyTo(function (msg) {
                    resolve(msg);
                }, function (reason) {
                    dffLoggingService.error(reason);
                    reject(reason);
                }, args);
        });
    };

    /**
     * Send a payment to LApp service.
     *
     * @name sendPayment
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param  {Payment} payment Payment to send.
     * @return {Promise} Promise that resolves with the send message.
     */
    self.sendPayment = function (payment) {
        return self.sendReplyTo({
            what: dff.app.packagepay.WHAT.NewPayment,
            obj: payment
        });
    };

    /**
     * Send endOfTour to LApp service.
     *
     * @name sendEndOfTour
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param  {EndOfTour} endOfTour EndOftour to send.
     * @return {Promise} Promise that resolves with the send message.
     */
    self.sendEndOfTour = function (endOfTour) {
        return self.sendReplyTo({
            what: dff.app.packagepay.WHAT.EndOfTour,
            obj: endOfTour
        });
    };

    /**
     * Send endOfTour silent to LApp service.
     *
     * @name sendEndOfTourSilent
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param  {EndOfTour} endOfTour EndOftour to send.
     * @return {Promise} Promise that resolves with the send message.
     */
    self.sendEndOfTourSilent = function (endOfTour) {
        return self.sendReplyTo({
            what: dff.app.packagepay.WHAT.EndOfTourSilent,
            obj: endOfTour
        });
    };

    /**
     * Send sendGotResult to LApp service.
     *
     * @name sendGotResult
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     *
     * @param  {Object} msg Result message to acknowlede.
     * @return {Promise} Promise that resolves with the send message.
     */
    self.sendGotResult = function (msg) {
        var gotMsg = {
            what: dff.app.packagepay.WHAT.GotResult,
            arg1: msg.what.ordinal,
            xml: msg.xml
        };

        return self.sendReplyTo(gotMsg);
    };

    /**
     * Request a list of all transactions.
     *
     * @name listTransactions
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     * @return {Promise} Promise that resolves with the send message.
     */
    self.listTransactions = function () {
        return self.sendReplyTo({
            what: dff.app.packagepay.WHAT.ListTransactions
        });
    };

    /**
     * Request SApp reset to defaults.
     *
     * @name resetToDefaults
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     * @return {Promise} Promise that resolves with the send message.
     */
    // self.resetToDefaults = function () {
    //     return self.sendReplyTo({
    //         what: dff.app.packagepay.WHAT.ResetToDefaults
    //     });
    // };

    /**
     * Request SApp to start WLAN.
     *
     * @name startWLAN
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     * @return {Promise} Promise that resolves with the send message.
     */
    self.startWLAN = function () {
        return self.sendReplyTo({
            what: dff.app.packagepay.WHAT.StartWLAN
        });
    };

    /**
     * Start SApp.
     *
     * @name startSApp
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     * @return {Promise} Promise that resolves when SApp started successful
     */
    self.startSApp = function () {
        return self.sendReplyTo({
            what: dff.app.packagepay.WHAT.StartSApp
        });
    };

    /**
     * Get all WHATs know by SApp.
     *
     * @name getWhats
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     * @return {Promise} Promise that resolves with all WHATs.
     */
    self.getWhats = function () {
        return new Promise(function (resolve, reject) {
            window.Packagepay.getWhats(function (whats) {
                resolve(whats);
            }, function (reason) {
                reject(reason);
            });
        });
    };

    /**
     * Get all VERIFY_ERRORs know by SApp.
     *
     * @name getVerifyErrors
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     * @return {Promise} Promise that resolves with all VERIFY_ERRORSs.
     */
    self.getVerifyErrors = function () {
        return new Promise(function (resolve, reject) {
            window.Packagepay.getVerifyErrors(function (verifyErrors) {
                resolve(verifyErrors);
            }, function (reason) {
                reject(reason);
            });
        });
    };

    /**
     * Bind LApp service.
     *
     * @name bindService
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     * @return {Promise} Promise that resolves when bind was successful.
     */
    self.bindService = function () {
        return new Promise(function (resolve, reject) {
            window.Packagepay.bindService(function () {
                resolve();
            }, function (reason) {
                reject(reason);
            });
        });
    };

    /**
     * Unbind LApp service.
     *
     * @name unbindService
     * @memberOf dff/app/packagepay.PackagepayService
     * @function
     * @instance
     * @return {Promise} Promise that resolves when unbind was executed.
     */
    self.unbindService = function () {
        return new Promise(function (resolve, reject) {
            window.Packagepay.unbindService(function () {
                resolve();
            }, function (reason) {
                reject(reason);
            });
        });
    };

    return self;
});
