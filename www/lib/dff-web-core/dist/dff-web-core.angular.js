/**
 * dff-web-core - v0.0.1 - Tue Jul 05 2016 16:50:30 GMT+0200 (CEST)
 * https://github.com/dff-solutions/dff-web-core.git#readme
 *
 * Copyright (c) 2015 dff solutions GmbH (http://www.dff-solutions.de)
 */

;(function () {
    'use strict';
angular
    .module('dff.app.com', [
        'dff.log',
        'dff.idb',
        'dff.settings',
        'dff.app.idb.store',
        'dff.app.cordova.connection'
    ])
    .value('dffAppShuttle', dff.app.com.Shuttle)
    .value('dffAppHeartbeatTicket', dff.app.com.HeartbeatTicket)
    .factory('dffIncomingMessageBroadcaster', ['$rootScope', function ($rootScope) {
        var self = {};

        self.onIncomingMessage = function (message) {
            $rootScope.$broadcast("incomingMessage", message);
        };

        return self;
    }])
    .provider('dffShuttleService', function () {
        var messageIncomingListeners = [];

        this.addMessageIncomingListener = function(Listener) {
            messageIncomingListeners.push(Listener);
        };

        this.$get = ['$injector', 'dffLoggingService', 'dffSettingsService', 'dffAppConnectionService', 'dffIdbIndexedDBService', 'dffMessageOutgoingStore', 'dffMessageIncomingStore', 'dffLogfileStore', function (
            $injector,
            dffLoggingService,
            dffSettingsService,
            dffAppConnectionService,
            dffIdbIndexedDBService,
            dffMessageOutgoingStore,
            dffMessageIncomingStore,
            dffLogfileStore
        ) {
            var incomingListeners = [];

            messageIncomingListeners.forEach(function (listener) {
                if (typeof listener === "string") {
                    incomingListeners.push($injector.get(listener));
                }
                else {
                    incomingListeners.push(listener);
                }
            });

            return new dff.app.com.ShuttleService(
                dffLoggingService,
                dffSettingsService,
                dffAppConnectionService,
                dffIdbIndexedDBService,
                dffMessageOutgoingStore,
                dffMessageIncomingStore,
                dffLogfileStore,
                incomingListeners
            );
        }];
    })
    .config(['dffShuttleServiceProvider', function (dffShuttleServiceProvider) {
        dffShuttleServiceProvider
            .addMessageIncomingListener('dffIncomingMessageBroadcaster');

        // circular dependency
        //dffAppConnectionServiceProvider
        //    .addConnectionChangeListener('dffShuttleService');
    }])
    // to avoid circular dependency
    .run(['$rootScope', 'dffShuttleService', function ($rootScope, dffShuttleService) {
        $rootScope.$on('connectionChange', function (event, connection) {
            dffShuttleService.onConnectionChange(connection);
        });
    }]);


    angular
    .module('dff.app.idb.store', ['dff.idb', 'dff.idb.store'])
    .provider('dffLogfileStore', function() {
        var name = "Logfile";
        var access = "readwrite";

        this.setName = function (n) {
            name = n;
        };

        this.setAccess = function (a) {
            access = a;
        };

        this.$get = ['dffIdbIndexedDBService', function (dffIdbIndexedDBService) {
            return dffIdbIndexedDBService.getObjectStore(name, access);
        }];
    })
    .provider('dffMessageOutgoingStore', function() {
        var name = "MessageOutgoing";
        var access = "readwrite";

        this.setName = function (n) {
            name = n;
        };

        this.setAccess = function (a) {
            access = a;
        };

        this.$get = ['dffIdbIndexedDBService', function (dffIdbIndexedDBService) {
            return dffIdbIndexedDBService.getObjectStore(name, access);
        }];
    })
    .provider('dffMessageIncomingStore', function() {
        var name = "MessageIncoming";
        var access = "readwrite";

        this.setName = function (n) {
            name = n;
        };

        this.setAccess = function (a) {
            access = a;
        };

        this.$get = ['dffIdbIndexedDBService', function (dffIdbIndexedDBService) {
            return dffIdbIndexedDBService.getObjectStore(name, access);
        }];
    });
    angular
        .module('dff.app.log', ['dff.app.idb.store'])
        .provider('dffLoggingStoreInterceptor', function () {
            var storeDebug = false;

            this.setStoreDebug = function (sd) {
                storeDebug = !!sd;
            };

            this.$get = ['$log', 'dffLogfileStore', function($log, dffLogfileStore) {
                return new dff.app.log.LoggingStoreInterceptor($log, dffLogfileStore, storeDebug);
            }];
        });
    angular
        .module('dff.datetime', [])
        .provider('dffDateTimeService', function () {
            var defaultFormat = 'yyyy-MM-dd HH:mm:ss';

            this.setDefaultFormat = function (format) {
                defaultFormat = format;
            };

            this.$get = ['dateFilter', function (dateFilter) {
                dff.datetime.DateTimeService.prototype.getFormatedDate = function (format) {
                    if (format) {
                        return dateFilter(this.getDate(), format);
                    }
                    else {
                        return dateFilter(this.getDate(), defaultFormat);
                    }
                };

                return new dff.datetime.DateTimeService();
            }];
        });

    angular
        .module('dff.dom', [])
        .factory('dffDomMutationObserverService', function () {
            return new dff.dom.MutationObserverService();
        })
        .directive('dffDomMutationObserver', ['dffDomMutationObserverService', function (dffDomMutationObserverService) {
            function link(scope, element, attrs) {
                var options = attrs.dffDomMutationObserver.split(",");

                var config = {
                    childList: false,
                    attributes: false,
                    characterData: false,
                    subtree: false,
                    attributeOldValue: false,
                    characterDataOldValue: false
                };

                if (options.indexOf("childList") >= 0) {
                    config.childList = true;
                }

                if (options.indexOf("attributes") >= 0) {
                    config.attributes = true;
                }

                if (options.indexOf("characterData") >= 0) {
                    config.characterData = true;
                }

                if (options.indexOf("subtree") >= 0) {
                    config.subtree = true;
                }

                if (options.indexOf("attributeOldValue") >= 0) {
                    config.attributeOldValue = true;
                }

                if (options.indexOf("characterDataOldValue") >= 0) {
                    config.characterDataOldValue = true;
                }

                dffDomMutationObserverService.observe(element[0], config);
            }

            return {
                priority: 9999,
                link: link
            };
        }]);
    angular
        .module('dff.gps.tools', [])
        .provider('dffGpsToolsService', function () {
            var R;

            this.setEarthRadius = function (earthRadius) {
                R = earthRadius;
            };

            this.$get = function () {
                return new dff.gps.tools.ToolsService(R);
            };
        });
    /**
     * @ngdoc service
     * @name dffIdbIndexedDBService
     * @description Service to access IndexedDB.
     */
    angular
        .module('dff.idb', [])
        .provider('dffIdbIndexedDBService', function () {
            var dbname = "dff-app";
            var dbversion = 1;
            var upgradeInterceptors = [];

            this.setVersion = function (v) {
                dbversion = v;
            };

            this.setDBName = function (value) {
                dbname = value;
            };

            this.addUpgradeInterceptor = function (upgradeInterceptor) {
                upgradeInterceptors.push(upgradeInterceptor);
            };

            this.$get = ['$log', function ($log) {
                return new dff.idb.IndexedDBService(dbname, dbversion, upgradeInterceptors, $log);
            }];
        });
    angular
    .module('dff.idb.store', ['dff.idb'])
    .provider('dffSettingsStore', function() {
        var name = "Settings";
        var access = "readwrite";

        this.setName = function (n) {
            name = n;
        };

        this.setAccess = function (a) {
            access = a;
        };

        this.$get = ['dffIdbIndexedDBService', function (dffIdbIndexedDBService) {
            return dffIdbIndexedDBService.getObjectStore(name, access);
        }];
    })
    .provider('dffDataStore', function() {
        var name = "Data";
        var access = "readwrite";

        this.setName = function (n) {
            name = n;
        };

        this.setAccess = function (a) {
            access = a;
        };

        this.$get = ['dffIdbIndexedDBService', function (dffIdbIndexedDBService) {
            return dffIdbIndexedDBService.getObjectStore(name, access);
        }];
    });

    angular
        .module('dff.iso.3166', [])
        .factory('dffIso3166CodeService', function () {
              return new dff.iso[3166].CodeService();
        });


    angular
        .module('dff.log', ['dff.datetime'])
        .value('Logtype', dff.log.Logtype)
        .value('Logline', dff.log.Logline)
        .provider('dffLoggingService', function () {
            var interceptors = [];

            this.addInterceptor = function(interceptor) {
                interceptors.push(interceptor);
            };

            this.$get = ['$injector', '$log', 'dffDateTimeService', function($injector, $log, dffDateTimeService) {
                var logInterceptors = [];

                interceptors.forEach(function (interceptor) {
                    if (typeof interceptor === "string") {
                        logInterceptors.push($injector.get(interceptor));
                    }
                    else {
                        logInterceptors.push(interceptor);
                    }
                });

                return new dff.log.LoggingService($log, logInterceptors, dffDateTimeService);
            }];
        });
    angular
        .module('dff.settings', ['dff.idb.store'])
        .value('dffDefaultSettings', {})
        .factory('dffSettingsService', ['dffSettingsStore', 'dffDefaultSettings', function (dffSettingsStore, dffDefaultSettings) {
            return new dff.settings.SettingsService(dffSettingsStore, dffDefaultSettings);
        }]);

angular
    .module('dff.start', [])
    .provider('dffStartService', function () {
        var startservices = [];

        this.registerService = function (service, priority) {
            startservices.push({
                service: service,
                priority: isNaN(priority) ? 0 : priority
            });
            return this;
        };

        this.$get = ['$injector', 'dffLoggingService', function ($injector, dffLoggingService) {
            var self = {};

            // order by priority
            startservices.sort(function (a, b) {
                return b.priority - a.priority;
            });

            self.start = function() {
                // already ordered
                return startservices.reduce(function (prev, cur) {
                    return prev
                        .then(function () {
                            var service = $injector.get(cur.service);
                            dffLoggingService.info('dffStartService', 'starting service', cur.service, cur.priority);
                            if (service.hasOwnProperty('startService')) {
                                return service.startService();
                            }
                            else {
                                return Promise.reject('dffStartService error starting ' + cur.service + '. startService() method not defined');
                            }
                        });
                }, Promise.resolve());
            };

            return self;
        }];
    });


    angular
        .module('dff.storage', [])
        .factory('dffStorageService', ['$window', function ($window) {
            return new dff.storage.StorageService($window);
        }]);


angular
    .module('dff.util', [])
    .constant('guid', dff.util.guid);

angular
    .module('dff.app.cordova.common', ['dff.log'])
    .factory('dffCommonPluginService', ['$window', 'dffLoggingService', 'Logtype', function ($window, dffLoggingService, Logtype) {
        return new dff.app.cordova.common.PluginService($window, dffLoggingService, Logtype);
    }]);

angular
    .module('dff.app.cordova.connection', ['dff.log'])
    .provider('dffAppConnectionService', function () {
        var connectionChangeListerners = [];
        var serverConnectionChangeListerners = [];

        this.addConnectionChangeListener = function (interceptor) {
            connectionChangeListerners.push(interceptor);
        };

        this.addServerConnectionChangeListener = function (interceptor) {
            serverConnectionChangeListerners.push(interceptor);
        };

        this.$get = ['$injector', '$window', 'dffLoggingService', function ($injector, $window, dffLoggingService) {
            var cls = [];
            var scls = [];

            connectionChangeListerners.forEach(function (listener) {
                if (typeof listener === "string") {
                    cls.push($injector.get(listener));
                }
                else {
                    cls.push(listener);
                }
            });

            serverConnectionChangeListerners.forEach(function (listener) {
                if (typeof listener === "string") {
                    scls.push($injector.get(listener));
                }
                else {
                    scls.push(listener);
                }
            });

            return new dff.app.cordova.connection.ConnectionService($window, dffLoggingService, cls, scls);
        }];
    })
    .factory('dffAppConnectionListener', ['$rootScope', function ($rootScope) {
        var self = {
            onConnectionChange: function (connection) {
                $rootScope.$apply();
                $rootScope.$broadcast('connectionChange', connection);
            },
            onServerConnectionChange: function (hasServerConnection) {
                $rootScope.$apply();
                $rootScope.$broadcast('serverConnectionChange', hasServerConnection);
            }
        };

        return self;
    }])
    .config(['dffAppConnectionServiceProvider', function (dffAppConnectionServiceProvider) {
        // directly add listener to service to provide angular functionality
        dffAppConnectionServiceProvider.addConnectionChangeListener('dffAppConnectionListener');
        dffAppConnectionServiceProvider.addServerConnectionChangeListener('dffAppConnectionListener');
    }]);


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

        this.$get = ['$injector', '$window', 'Logtype', 'dffLoggingService', function($injector, $window, Logtype, dffLoggingService) {
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
        }];
    });


angular
    .module('dff.app.cordova.wifi.manager', ['dff.log'])
    .factory('dffWifiStateLogger', ['dffLoggingService', function (dffLoggingService) {
        return new dff.app.cordova.wifi.manager.WifiStateLogger(dffLoggingService);
    }])
    .factory('dffNetworkStateLogger', ['dffLoggingService', function (dffLoggingService) {
        return new dff.app.cordova.wifi.manager.NetworkStateLogger(dffLoggingService);
    }])
    .factory('dffScanResultsLogger', ['dffLoggingService', function (dffLoggingService) {
        return new dff.app.cordova.wifi.manager.ScanResultsLogger(dffLoggingService);
    }])
    .provider('dffWifiManagerService', function() {
        var networkStateChangeListeners = [];
        var wifiStateChangeListeners = [];
        var scanResultsListeners = [];

        this.addNetworkStateChangeListener = function (listener) {
            networkStateChangeListeners.push(listener);
        };
        this.addWifiStateChangeListener = function (listener) {
            wifiStateChangeListeners.push(listener);
        };
        this.addScanResultsListener = function (listener) {
            scanResultsListeners.push(listener);
        };

        this.$get = ['$injector', '$window', 'dffLoggingService', function ($injector, $window, dffLoggingService) {
            var nscl = [];
            var wscl = [];
            var srl  = [];

            networkStateChangeListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        nscl.push($injector.get(listener));
                    }
                    else {
                        nscl.push(listener);
                    }
                });

            wifiStateChangeListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        wscl.push($injector.get(listener));
                    }
                    else {
                        wscl.push(listener);
                    }
                });

            scanResultsListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        srl.push($injector.get(listener));
                    }
                    else {
                        srl.push(listener);
                    }
                });

            return new dff.app.cordova.wifi.manager.Service($window, dffLoggingService, nscl, wscl, srl);
        }];
    });

angular
    .module('dff.app.packagepay', ['dff.log'])
    .value('dffPackagepayPayment', dff.app.packagepay.Payment)
    .value('dffPackagepayLogistician', dff.app.packagepay.Logistician)
    .value('dffPackagepayPackage', dff.app.packagepay.Package)
    .value('dffPackagepayEndOfTour', dff.app.packagepay.EndOfTour)
    .value('dffPackagepayCardType', dff.app.packagepay.CardType)
    .value('dffPackagepayCustomerType', dff.app.packagepay.CustomerType)
    .value('dffPackagepayGirocardProcess', dff.app.packagepay.GirocardProcess)
    .value('dffPackagepayGirocardProcessing', dff.app.packagepay.GirocardProcessing)
    .value('dffPackagepayPaymentResult', dff.app.packagepay.PaymentResult)
    .value('dffPackagepayProcessType', dff.app.packagepay.ProcessType)
    .value('dffPackagepayWHAT', dff.app.packagepay.WHAT)
    .value('dffPackagepayVERIFY_ERROR', dff.app.packagepay.VERIFY_ERROR)
    .factory('dffPackagepayIncomingMessageLogger', ['dffLoggingService', function (dffLoggingService) {
        return new dff.app.packagepay.IncomingMessageLogger(dffLoggingService);
    }])
    .factory('dffPackagepayServiceConnectionLogger', ['dffLoggingService', function (dffLoggingService) {
        return new dff.app.packagepay.ServiceConnectionLogger(dffLoggingService);
    }])
    .provider('dffPackagepayService', function () {
        var incomingMessageListeners = [];
        var connectionChangeListeners = [];

        this.addIncomingMessageListener = function (listener) {
            incomingMessageListeners.push(listener);
        };

        this.addServiceConnectionChangeListener = function (listener) {
            connectionChangeListeners.push(listener);
        };

        this.$get = ['$injector', '$window', 'dffLoggingService', 'Logtype', function ($injector, $window, dffLoggingService, Logtype) {
            var iml = [];
            var ccl = [];

            incomingMessageListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        iml.push($injector.get(listener));
                    }
                    else {
                        iml.push(listener);
                    }
                });

            connectionChangeListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        ccl.push($injector.get(listener));
                    }
                    else {
                        ccl.push(listener);
                    }
                });

            return new dff.app.packagepay.PackagepayService($window, dffLoggingService, Logtype, iml, ccl);
        }];
    })
    .config(['dffPackagepayServiceProvider', function (dffPackagepayServiceProvider) {
        dffPackagepayServiceProvider.addIncomingMessageListener("dffPackagepayIncomingMessageLogger");
        dffPackagepayServiceProvider.addServiceConnectionChangeListener("dffPackagepayServiceConnectionLogger");
    }]);


angular
    .module('dff.app.cordova.toughpadapi', ['dff.log'])
    .factory('dffToughpadApiBarcodeLogger', ['dffLoggingService', function (dffLoggingService) {
        return new dff.app.cordova.toughpadapi.BarcodeLogger(dffLoggingService);
    }])
    .provider('dffToughpadApiService', function () {
        var barcodeListeners = [];

        this.addBarcodeListener = function (listener) {
            barcodeListeners.push(listener);
        };

        this.$get = ['$injector', '$window', 'dffLoggingService', 'Logtype', function ($injector, $window, dffLoggingService, Logtype) {
            var bcl = [];

            barcodeListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        bcl.push($injector.get(listener));
                    }
                    else {
                        bcl.push(listener);
                    }
                });

            return new dff.app.cordova.toughpadapi.ToughpadApiService($window, dffLoggingService, Logtype, bcl);
        }];
    })
    .config(['dffToughpadApiServiceProvider', function (dffToughpadApiServiceProvider) {
        dffToughpadApiServiceProvider.addBarcodeListener("dffToughpadApiBarcodeLogger");
    }]);
}());
