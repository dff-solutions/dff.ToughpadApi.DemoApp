
/**
 * @namespace dff/app/cordova/wifi/manager
 */
dff.namespace('dff.app.cordova.wifi.manager');

/**
 * Logger for wifi state
 *
 * @name WifiStateLogger
 * @memberOf dff/app/cordova/wifi/manager
 * @constructor
 *
 * @param  {object} dffLoggingService Instance of loggin service for logging,
 */
dff.define('dff.app.cordova.wifi.manager.WifiStateLogger', function (dffLoggingService) {
    return {
        onWifiStateChanged: function (state) {
            dffLoggingService.info('wifi state change from:', state.previous_wifi_stateName, "to:", state.wifi_stateName);
        }
    };
});

/**
 * Logger for network state
 *
 * @name NetworkStateLogger
 * @memberOf dff/app/cordova/wifi/manager
 * @constructor
 *
 * @param  {object} dffLoggingService Instance of loggin service for logging,
 */
dff.define('dff.app.cordova.wifi.manager.NetworkStateLogger', function (dffLoggingService) {
    return {
        onNetworkStateChanged: function (state) {
            if (state) {
                if (state.networkInfo) {
                    dffLoggingService.info(
                        'network state - network info:',
                        "state:", state.networkInfo.state,
                        "extraInfo:", state.networkInfo.extraInfo
                    );
                }

                if (state.wifiInfo) {
                    dffLoggingService.info(
                        'network state - wifi info:',
                        "ssid:", state.wifiInfo.ssid,
                        "rssi:", state.wifiInfo.rssi,
                        "linkSpeed:", state.wifiInfo.linkSpeed
                    );
                }
            }

        }
    };
});

/**
 * Logger for scan results
 *
 * @name ScanResultsLogger
 * @memberOf dff/app/cordova/wifi/manager
 * @constructor
 *
 * @param  {object} dffLoggingService Instance of loggin service for logging,
 */
dff.define('dff.app.cordova.wifi.manager.ScanResultsLogger', function (dffLoggingService) {
    return {
        onScanResultsAvailable: function (scanResults) {
            dffLoggingService.log('wifi scan results available:', scanResults);
        }
    };
});

/**
 * Service for interacting with cordova wifimanager plugin.
 *
 * @name WifiMangerService
 * @memberOf dff/app/cordova/wifi/manager
 * @constructor
 *
 * @param {Object} window Window object as closure for Packagepay plugin object.
 * @param {Object} dffLoggingService dffLoggingService for logging.
 * @param {Object[]} networkStateChangeListeners Listeners for network state changes.
 * @param {Object[]} wifiStateChangeListeners Listeners for wifi state changes.
 * @param {Object[]} scanResultsListeners Listeners for wifi scan results.
 */
dff.define('dff.app.cordova.wifi.manager.Service', function (
    window,
    dffLoggingService,
    networkStateChangeListeners,
    wifiStateChangeListeners,
    scanResultsListeners
) {
    var self = {};

    networkStateChangeListeners = networkStateChangeListeners || [];
    wifiStateChangeListeners = wifiStateChangeListeners || [];
    scanResultsListeners = scanResultsListeners || [];

    /**
     * Notifies all network state change listeners with network state.
     *
     * @name notifyIncomingMessageListener
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} msg Message to notify listeners with.
     */
    self.notifyNetworkStateChangeListeners = function (state) {
        return networkStateChangeListeners
            .reduce(function (prev, cur) {
                return prev
                    .then(function () {
                        return cur.onNetworkStateChanged(state);
                    });
            }, Promise.resolve())
            .catch(function (reason) {
                dffLoggingService.error(reason);
                throw(reason);
            });
    };

    /**
     * Notifies all wifi state change listeners with state.
     *
     * @name notifyWifiStateChangeListeners
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} msg Message to notify listeners with.
     */
    self.notifyWifiStateChangeListeners = function (state) {
        return wifiStateChangeListeners
            .reduce(function (prev, cur) {
                return prev
                    .then(function () {
                        return cur.onWifiStateChanged(state);
                    });
            }, Promise.resolve())
            .catch(function (reason) {
                dffLoggingService.error(reason);
                throw(reason);
            });
    };

    /**
     * Notifies all scan results listeners with state.
     *
     * @name notifyIncomingMessageListener
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} msg Message to notify listeners with.
     */
    self.notifyScanResultsListeners = function (scanResult) {
        return scanResultsListeners
            .reduce(function (prev, cur) {
                return prev
                    .then(function () {
                        return cur.onScanResultsAvailable(scanResult);
                    });
            }, Promise.resolve())
            .catch(function (reason) {
                dffLoggingService.error(reason);
                throw(reason);
            });
    };

    /**
     * Registers a new listener for network state changes.
     *
     * @name addNetworkStateChangeListener
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} listener A listener for network state changes.
     *                          Must implement a onNetworkStateChanged function.
     */
    self.addNetworkStateChangeListener = function (listener) {
        networkStateChangeListeners.push(listener);
    };

    /**
     * Removes a listener for network state changes.
     *
     * @name removeNetworkStateChangeListener
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} listener A registered listener for network state changes.
     */
    self.removeNetworkStateChangeListener = function (listener) {
        var i = networkStateChangeListeners.indexOf(listener);

        if (i >= 0) {
            networkStateChangeListeners.splice(i, 1);
        }
    };

    /**
     * Registers a new listener for wifi state changes.
     *
     * @name addWifiStateChangeListener
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} listener A listener for wifi state changes.
     *                          Must implement a onWifiStateChanged function.
     */
    self.addWifiStateChangeListener = function (listener) {
        wifiStateChangeListeners.push(listener);
    };

    /**
     * Removes a listener for network state changes.
     *
     * @name removeWifiStateChangeListener
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} listener A registered listener for wifi state changes.
     */
    self.removeWifiStateChangeListener = function(listener) {
        var i = wifiStateChangeListeners.indexOf(listener);

        if (i >= 0) {
            wifiStateChangeListeners.splice(i, 1);
        }
    };

    /**
     * Registers a new listener for wifi scan results.
     *
     * @name addScanResultsListener
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} listener A listener for scn results.
     *                          Must implement a onScanResultsAvailable function.
     */
    self.addScanResultsListener = function (listener) {
        scanResultsListeners.push(listener);
    };

    /**
     * Removes a listener for scan results.
     *
     * @name removeScanResultsListener
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {Object} listener A registered listener for scan results.
     */
    self.removeScanResultsListener = function(listener) {
        var i = scanResultsListeners.indexOf(listener);

        if (i >= 0) {
            scanResultsListeners.splice(i, 1);
        }
    };

    /**
     * Starts wifi manager service.
     * Registers handler for log events and messages from cordova packagepay plugin.
     *
     * @name startService
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @returns {Promise} Promise that resolves when window.WifiManager is defined.
     */
    self.startService = function () {
        return new Promise(function (resolve, reject) {
            if (window.WifiManager) {
                window.WifiManager
                    .onNetworkStateChanged(function (state) {
                        self.notifyNetworkStateChangeListeners(state);
                    }, function (reason) {
                        dffLoggingService.error(reason);
                    });

                window.WifiManager
                    .onWifiStateChanged(function (state) {
                        self.notifyWifiStateChangeListeners(state);
                    }, function (reason) {
                        dffLoggingService.error(reason);
                    });

                window.WifiManager
                    .onScanResultsAvailable(function (scanResults) {
                        self.notifyScanResultsListeners(scanResults);
                    }, function (reason) {
                        dffLoggingService.error(reason);
                    });

                resolve();
            }
            else {
                reject("wifimanager plugin not available");
            }
        });
    };

    /**
     * Return dynamic information about the current Wi-Fi connection, if any is active.
     *
     * @name getConnectionInfo
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @return {object} A Promise that resolves with wifi info if any wifi is active
     */
    self.getConnectionInfo = function () {
        return new Promise(function (resolve, reject) {
            window.WifiManager
                .getConnectionInfo(function (wifiInfo) {
                    resolve(wifiInfo);
                }, function (reason) {
                    reject(reason);
                });
        });
    };

    /**
     * Return the results of the latest access point scan.
     *
     * @name getScanResults
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @return {Object} A Promise that resolves with the list of access points
     *                  found in the most recent scan
     */
    self.getScanResults = function () {
        return new Promise(function (resolve, reject) {
            window.WifiManager
                .getScanResults(function (scanResults) {
                    resolve(scanResults);
                }, function (reason) {
                    reject(reason);
                });
        });
    };

    /**
     * Gets the Wi-Fi enabled state
     *
     * @name getWifiState
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @return {object} A promise that resolves with wifi state.
     *                  One of WIFI_STATE_DISABLED, WIFI_STATE_DISABLING,
     *                   WIFI_STATE_ENABLED, WIFI_STATE_ENABLING, WIFI_STATE_UNKNOWN
     */
    self.getWifiState = function () {
        return new Promise(function (resolve, reject) {
            window.WifiManager
                .getWifiState(function (wifiState) {
                    resolve(wifiState);
                }, function (reason) {
                    reject(reason);
                });
        });
    };

    /**
     * Disable a configured network.
     * The specified network will not be a candidate for associating.
     * This may result in the asynchronous delivery of state change events.
     *
     * @name disableNetwork
     * @memberOf dff/app/cordova/wifi/manager.Service
     * @function
     * @instance
     *
     * @param {number} netId The ID of the network to diable.
     * @return {object} Promise that resolves if operations succeeded. Promise rejects otherwise.
     */
    self.disableNetwork = function (netId) {
        return new Promise(function (resolve, reject) {
            window.WifiManager
                .disableNetwork(function (wifiState) {
                    resolve(wifiState);
                }, function (reason) {
                    reject(reason);
                }, {
                    netId: netId
                });
        });
    };

    return self;
});