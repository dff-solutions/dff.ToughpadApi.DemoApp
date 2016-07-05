/**
 * dff-web-core - v0.0.1 - Tue Jul 05 2016 16:50:30 GMT+0200 (CEST)
 * https://github.com/dff-solutions/dff-web-core.git#readme
 *
 * Copyright (c) 2015 dff solutions GmbH (http://www.dff-solutions.de)
 */

;(function () {
    'use strict';
    /**
     * The <b>dff</b> object provides a global namespace to build the
     * library structure of dff web applications.
     * You have to use {@link dff#define} to create a sub namespace and its
     * component functionality.
     *
     * @namespace dff
     * @package dff-web-core
     */
    var dff = window.dff = {};

    /**
     * Creates the given namespace within <b>dff</b> namespace.
     * The method returns a namespace object. Simply pass a string that
     * represents a namespace using dot notation. E.g. <b><code>foo.bar.murx</code></b>.
     * All namespaces are created under <b>dff</b> namespace. If <b>dff</b> is given as root namespace
     * it gets stripped out.
     *
     * @name namespace
     * @memberOf dff
     * @function
     * @instance
     *
     * @param {string} namespace A string that represents a new namespace e.g. <b><code>foo.bar.murx<code></b>.
     * @returns {object} A namespace object containing information about the current and parent
     * targets with the structure:
     * <ul>
     *     <li>targetParent - Parent namespace object</li>
     *     <li>targetName - Current namespace name.</li>
     *     <li>bind - A function to bind a value to the namespace.</li>
     * </ul>
     */
    dff.namespace = function (namespaceString) {
        var parts = namespaceString.split('.');
        var parent = dff;
        var i;

        // strip redundant leading global
        if (parts[0] === 'dff') {
            parts = parts.slice(1);
        }

        var targetParent = dff;
        var targetName;

        for (i = 0; i < parts.length; i++) {
            // create a property if it doesn't exist
            if (typeof parent[parts[i]] === 'undefined') {
                parent[parts[i]] = {};
            }

            if (i === parts.length - 2) {
                targetParent = parent[parts[i]];
            }

            targetName = parts[i];
            parent = parent[parts[i]];
        }

        return {
            targetParent: targetParent,
            targetName: targetName,
            bind: function (target) {
                targetParent[targetName] = target;
            }
        };
    };

    /**
     * The <b><code>define</code></b> method delegates to {@link dff#namespace} and binds a new value to its given namespace.
     * Namespace rules are the same as for {@link dff#namespace}.
     * A second argument has to be a constructor function that will be bound to the given namespace.
     *
     * This method is generally used to definde new components in the <b>dff</b> namespace.
     *
     * @name define
     * @memberOf dff
     * @function
     * @instance
     *
     */
    dff.define = function (namespace, fn) {
        dff.namespace(namespace).bind(fn);
    };


dff.namespace('dff.app.com');

dff.define('dff.app.com.Shuttle', function (MidId, MiDversion, MessageId, BuildingTime, Net, Position, InProgress, Channel, HighPrio) {
    this.MidId = MidId;
    this.MiDversion = MiDversion;
    this.MessageId = MessageId;
    this.BuildingTime = BuildingTime;
    this.Net = Net;
    this.Position = Position;
    this.InProgress = InProgress;
    this.Channel = Channel;
    this.HighPrio = HighPrio;
});

dff.define('dff.app.com.HeartbeatTicket', function (Zeitpunkt, MobilgeraetIDENT, FahrzeugID, TourID, Position, AkkuInfo, PowerInfo, StandortID, StandortIdent, BenutzerMobilID, BeifahrerID) {
    this.Zeitpunkt = Zeitpunkt;
    this.MobilgeraetIDENT = MobilgeraetIDENT;
    this.FahrzeugID = FahrzeugID;
    this.TourID = TourID;
    this.Position = Position;
    this.AkkuInfo = AkkuInfo;
    this.PowerInfo = PowerInfo;
    this.StandortID = StandortID;
    this.StandortIdent = StandortIdent;
    this.BenutzerMobilID = BenutzerMobilID;
    this.BeifahrerID = BeifahrerID;
});

dff.define('dff.app.com.ShuttleService', function (
    dffLoggingService,
    dffSettingsService,
    dffAppConnectionService,
    dffIdbIndexedDBService,
    dffMessageOutgoingStore,
    dffMessageIncomingStore,
    dffLogfileStore,
    messageIncomingListeners
) {
    var self = {};

    var notificationIncomingPromise = Promise.resolve();
    var workerInput = {
        idbSettings: {
            IDBName: dffIdbIndexedDBService.dbname,
            MessageOutgoingStore: dffMessageOutgoingStore.name,
            LogfileStore: dffLogfileStore.name
        },
        messageOutgoingIndex: "BuildingTime",
        action: null,
        url: null,
        interval: 1000
    };
    var serverConnection = false;
    var isStarted = false;
    var workerStarted = false;
    var sentShuttlesWorker = new Worker("lib/dff-web-core/src/app/worker/MessageBoxSentShuttlesWorker.js");

    messageIncomingListeners = messageIncomingListeners || [];

    function notifyIncomingListeners (response) {
        notificationIncomingPromise = notificationIncomingPromise
            .then(function () {
                return messageIncomingListeners.reduce(function (prev, cur) {
                    return prev
                        .then(function () {
                            return cur.onIncomingMessage(response);
                        });
                }, Promise.resolve());
            });

        return notificationIncomingPromise;
    }

    function startWorker () {
        if (dffAppConnectionService.getConnection() === "WLAN") {
            workerInput.url = dffSettingsService.settings.IPWLAN;
        }
        else {
            workerInput.url = dffSettingsService.settings.IPGPRS;
        }

        workerInput.url += dffSettingsService.settings.ServerRoute;

        workerInput.action = 'start';
        workerInput.interval = dffSettingsService.settings.ShuttleCheckInterval;
        sentShuttlesWorker.postMessage(workerInput);
        workerStarted = true;
    }

    function stopWorker() {
        if (workerStarted) {
            sentShuttlesWorker.postMessage({ action: 'stop' });
            workerStarted = false;
        }
    }

    function onIncomingMessage(response) {
        response.forEach(function (resp) {
            if (!resp.MessageId) {
                dffLoggingService.warn("ShuttleService - onIncomingMessage: MessagId invalid, generating a guid.", resp);
                resp.MessageId = dff.util.guid.generate();
            }
        });

        return dffMessageIncomingStore
            .add(response)
            .then(function () {
                response.forEach(function (resp) {
                    notifyIncomingListeners(resp);
                });
            })
            .catch(function (reason) {
                dffLoggingService.error("ShuttleService - error on incoming message:", reason);
                throw reason;
            });
    }

    sentShuttlesWorker.onmessage = function (event) {
        serverConnection = event.data.serverConnection;

        if (!event.data.error) {
            dffAppConnectionService.setServerConnected(true);
            onIncomingMessage(event.data.response);
        }
        else {
            dffAppConnectionService.setServerConnected(false);
        }
    };

    sentShuttlesWorker.onerror = function (error) {
        dffLoggingService.error("ShuttleService - worker error:", error);
    };

    self.onConnectionChange = function () {
        // stop anyway since connection type might have changed.
        stopWorker();

        // restart if network available and service has been started.
        if (dffAppConnectionService.hasConnection() && isStarted) {
            startWorker();
        }
    };

    self.addMessageIncomingListener = function (messageIncomingListener) {
        messageIncomingListeners.push(messageIncomingListener);
    };

    self.sendShuttle = function (shuttle) {
        return dffMessageOutgoingStore
            .add(shuttle)
            .catch(function (reason) {
                dffLoggingService.error("ShuttleService - error adding shuttle to MessageOutgoingStore", reason);
                throw reason;
            });
    };

    self.outgoingQueueContainsType = function (type) {
        return dffMessageOutgoingStore
            .countIndex("Type", { only: type })
            .then(function (count) {
                return count > 0;
            });
    };

    self.startService = function () {
        if (dffAppConnectionService.hasConnection()) {
            startWorker();
        }

        isStarted = true;
    };

    self.stopService = function () {
        stopWorker();
        isStarted = false;
    };

    return self;
});

    /**
     * @name dff.app.idb.store.LogfileInterceptor
     * @package dff.app.idb.store
     *
     * @description
     * Interceptor to create logfile object store when indexedDB is created
     * or updated.
     *
     * @param {string} name Name of the logfile objectstore. Defaults to "Logfile" if not specified.
     */
    dff.define("dff.app.idb.store.LogfileInterceptor", function (name) {
        this.name = name || "Logfile";
    });

    /**
     * @name dff.app.idb.store.LogfileInterceptor#onupgradeneeded
     * @package dff.app.idb.store
     * @methodOf dff.app.idb.store.LogfileInterceptor
     *
     * @description
     * Gets called by IndexedDBService when indexedDB needs an upgrade.
     *
     * @param {Object} event IDBVersionChangeEvent from IDBOpenDBRequest.
     */
    dff.app.idb.store.LogfileInterceptor.prototype.onupgradeneeded = function (event) {
        var db = event.target.result;

        if (!db.objectStoreNames.contains(this.name)) {
            var objectStore = db.createObjectStore(this.name, { keyPath: "id", autoIncrement: true });
            // search by timestamp
            objectStore.createIndex("timestamp", "timestamp", { unique: false });

            // search by sending type
            objectStore.createIndex("type", "type", { unique: false });
        }
    };


    /**
     * @name dff.app.idb.store.MessageOutgoingInterceptor
     * @package dff.app.idb.store
     *
     * @description
     * Interceptor to create message outgoing object store when indexedDB is created
     * or updated.
     *
     * @param {string} name Name of the message outgoing objectstore. Defaults to "MessageOutgoing" if not specified.
     */
    dff.define('dff.app.idb.store.MessageOutgoingInterceptor', function (name) {
        this.name = name || "MessageOutgoing";
    });

    /**
     * @name dff.app.idb.store.MessageOutgoingInterceptor#onupgradeneeded
     * @package dff.app.idb.store
     * @methodOf dff.app.idb.store.MessageOutgoingInterceptor
     *
     * @description
     * Gets called by IndexedDBService when indexedDB needs an upgrade.
     *
     * @param {Object} event IDBVersionChangeEvent from IDBOpenDBRequest.
     */
    dff.app.idb.store.MessageOutgoingInterceptor.prototype.onupgradeneeded = function (event) {
        var db = event.target.result;

        if (!db.objectStoreNames.contains(this.name)) {
            var objectStore = db.createObjectStore(this.name, { keyPath: "MessageId" });

            // search by sending type
            objectStore.createIndex("Channel", "Channel", { unique: false });

            // search by timestamp
            // should be unique but if not it's better to send in wrong order than to loose one
            objectStore.createIndex("BuildingTime", "BuildingTime", { unique: false });

            // search by Type
            objectStore.createIndex("Type", "Type", { unique: false });
        }
    };

    /**
     * @name dff.app.idb.store.MessageIncomingInterceptor
     * @package dff.app.idb.store
     *
     * @description
     * Interceptor to create message incoming object store when indexedDB is created
     * or updated.
     *
     * @param {string} name Name of the message outgoing objectstore. Defaults to "MessageIncoming" if not specified.
     */
    dff.define('dff.app.idb.store.MessageIncomingInterceptor', function (name) {
        this.name = name || "MessageIncoming";
    });

    /**
     * @name dff.app.idb.store.MessageIncomingInterceptor#onupgradeneeded
     * @package dff.app.idb.store
     * @methodOf dff.app.idb.store.MessageIncomingInterceptor
     *
     * @description
     * Gets called by IndexedDBService when indexedDB needs an upgrade.
     *
     * @param {Object} event IDBVersionChangeEvent from IDBOpenDBRequest.
     */
    dff.app.idb.store.MessageIncomingInterceptor.prototype.onupgradeneeded = function (event) {
        var db = event.target.result;

        if (!db.objectStoreNames.contains(this.name)) {
            var objectStore = db.createObjectStore(this.name, { keyPath: "MessageId" });

            // search by sending type
            objectStore.createIndex("Channel", "Channel", { unique: false });

            // search by timestamp
            // should be unique but if not it's better to send in wrong order than to loose one
            objectStore.createIndex("BuildingTime", "BuildingTime", { unique: false });

            // search by Type
            objectStore.createIndex("Type", "Type", { unique: false });
        }
    };

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
    /**
     * Datetime namespace provides functionality for date time operations.
     * A new date should always be retrieved using this service because
     * that way a dates can easily be mocked during testing.
     *
     * @namespace dff/datetime
     */
    dff.namespace('dff.datetime');


    /**
     * Provides date time operations.
     *
     * @name  DateTimeService
     * @memberOf dff/datetime
     * @constructor
     */
    dff.define('dff.datetime.DateTimeService', function () {});

    /**
     * Get new date.
     *
     * @name getDate
     * @memberOf dff/datetime.DateTimeService
     * @function
     * @instance
     *
     * @return {Date} New date with current datetime.
     */
    dff.datetime.DateTimeService.prototype.getDate = function () {
        return new Date();
    };

    /**
     * @namespace dff/dom
     */
    dff.namespace('dff.dom');

    /**
     * Observes given dom element for specfied mutations.
     * For each mutation that is observed the registered observers are notified.
     *
     * @name MutationObserverService
     * @memberOf dff/dom
     * @constructor
     *
     */
    dff.define('dff.dom.MutationObserverService', function () {
        this.observers = [];
    });

    /**
     * Adds an observer that gets notified on mutations.
     *
     * @name addObserver
     * @memberOf dff/dom.MutationObserverService
     * @instance
     *
     * @param {object} observer A observer to notify on mutations.
     */
    dff.dom.MutationObserverService.prototype.addObserver = function (observer) {
        // don't add observer twice
        if (this.observers.indexOf(observer) < 0) {
            this.observers.push(observer);
        }
    };

    /**
     * Removes all observers.
     *
     * @name clearObservers
     * @memberOf dff/dom.MutationObserverService
     * @instance
     */
    dff.dom.MutationObserverService.prototype.clearObservers = function () {
        this.observers = [];
    };

    /**
     * Listens to mutations and notifies all observers which listen to the mutations type.
     *
     * @name onMutation
     * @memberOf dff/dom.MutationObserverService
     * @instance
     *
     * @param {object} mutation A mutation observed and observers should be notified about.
     */
    dff.dom.MutationObserverService.prototype.onMutation = function(mutation) {
        this.observers.forEach(function (observer) {
            if (observer.types.indexOf(mutation.type) >= 0) {
                observer.onMutation(mutation);
            }
        });
    };

    /**
     * Observes a DOM element on specified mutations.
     *
     * @name observe
     * @memberOf dff/dom.MutationObserverService
     * @instance
     *
     * @param {object} element DOM element to observe.
     * @param {object} config Options that define which kind of mutation should be observed.
     * @param {boolean} config.childList               Set to true if child elements should be observed.
     * @param {boolean} config.attributes              Set to true if element attributes should be observed.
     * @param {boolean} config.characterData           Set to true if element data should be observed.
     * @param {boolean} config.subtree                 Set to true if changes below child notes should also be observed.
     * @param {boolean} config.attributeOldValue       Set to true if old value of attributes should be observed.
     * @param {boolean} config.characterDataOldValue   Set to true if old data values should be observed.
     */
    dff.dom.MutationObserverService.prototype.observe = function (element, config) {
        var self = this;

        var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                self.onMutation(mutation);
            });
        });

        observer.observe(element, config);
    };

    /**
     * @namespace dff/gps/tools
     */
    dff.namespace('dff.gps.tools');

    /**
     * Provides Tools for GPS/coordinates.
     *
     * @name ToolsService
     * @memberOf dff/gps/tools
     * @constructor
     *
     * @param {Number} earthRadius Radius of earth in meters to use for calculations.
     * Default is 6378136.
     */
    dff.define('dff.gps.tools.ToolsService', function (earthRadius) {
        var self = {};
        var R = earthRadius || 6378136, // meters
            cf = Math.PI / 180;

        /**
         * Calculates the distance between two geographical coordinates.
         * Using haversine formula {@link http://en.wikipedia.org/wiki/Haversine_formula}
         *
         * @name getDistanceDec
         * @memberOf dff/gps/tools.ToolsService
         * @instance
         *
         * @param {Number} lon1 - Geographical longitute point 1 in degrease.
         * @param {Number} lat1 - Geographical latitute point 1 in degrease.
         * @param {Number} lon2 - Geographical longitute point 2 in degrease.
         * @param {Number} lat2 - Geographical latitute point 2 in degrease.
         *
         * @return {Number} distance - distance in meters.
         */
        self.getDistanceDec = function (lon1, lat1, lon2, lat2) {
            // convert deg to rad
            lat1 *= cf;
            lon1 *= cf;
            lat2 *= cf;
            lon2 *= cf;

            var dlat = (lat2 - lat1);
            var dlon = (lon2 - lon1);

            var a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dlon / 2) * Math.sin(dlon / 2);

            var c = 2 * Math.asin(Math.sqrt(a));
            var d = R * c;

            return d;
        };

        /**
         * Converts degree minutes sec to decimal degrees
         *
         * @name dms2Dec
         * @memberOf dff/gps/tools.ToolsService
         * @instance
         *
         * @param {Number} deg - Geographical degree.
         * @param {Number} min - Geographical minute.
         * @param {Number} sec - Geographical second.
         *
         * @return {Number} dec - Decimal degrees.
         */
        self.dms2Dec = function (deg, min, sec) {
            var f = 1;

            if (deg < 0) {
                f = -1;
            }

            return f * (f * deg + min / 60 + sec / 36000);
        };

        /**
         * Converts decimal degree str to number.
         *
         * @name parseStringDec
         * @memberOf dff/gps/tools.ToolsService
         * @instance
         *
         * @param {Number} strDeg - Geographical degree as string.
         *
         * @return {Number} dec - Decimal degrees.
         */
        self.parseStringDec = function (strDeg) {
            var degStrExp = /^(-?)([0-9]*)[\.,]?([0-9]*)$/;

            if (typeof strDeg === "string") {
                var sign = 1;
                var strDegPre;
                var strDegSuf;
                var strDegMatches = degStrExp.exec(strDeg);

                if (strDegMatches && strDegMatches.length >= 4) {
                    if (strDegMatches[1] === "-") {
                        sign = -1;
                    }

                    if (strDegMatches[2]) {
                        strDegPre = parseInt(strDegMatches[2]);
                    }
                    else {
                        strDegPre = 0;
                    }

                    if (strDegMatches[3]) {
                        strDegSuf = parseInt(strDegMatches[3]);
                    }
                    else {
                        strDegSuf = 0;
                    }

                    strDeg = sign * (strDegPre + strDegSuf / Math.pow(10, strDegMatches[3].length));
                }
                else {
                    throw new Error("unexpected format for strDeg: " + strDeg);
                }
            }

            return strDeg;
        };

        /**
         * Takes a dffFence and returns an object with lat, lon properties.
         *
         * @name getLonLatFromDffFence
         * @memberOf dff/gps/tools.ToolsService
         * @instance
         *
         * @param {string} fence dffFence.
         *
         * @return {object} coords Object with lat, lon properties.
         */
        self.getLonLatFromDffFence = function (fence) {
            var mr = /^([0-9]+)@(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)/;

            var matchs = mr.exec(fence);

            //kein dffFence
            if (!matchs) {
                return;
            }

            //zerlegen in die bestandteile
            var londeg = parseInt(matchs[2]);
            var lonmin = parseInt(matchs[3]);
            var lonsec = parseInt(matchs[4]);
            var latdeg = parseInt(matchs[5]);
            var latmin = parseInt(matchs[6]);
            var latsec = parseInt(matchs[7]);

            //zusammenfassen zu lat und lon
            var lat = self.dms2Dec(latdeg, latmin, latsec);
            var lon = self.dms2Dec(londeg, lonmin, lonsec);

            return {lat: lat, lon: lon};
        };

        return self;
    });

    /**
     * @namespace dff/idb
     */
    dff.namespace("dff.idb");

    /**
     * Error class for Errors related to IndexedDB access.
     *
     * @name dff.idb.IDBError
     * @memberOf dff/idb
     * @constructor
     *
     * @param {object} event Event related to IndexedDB error.
     * @param {string} msg   Message describing the error.
     */
    dff.define('dff.idb.IDBError', function (event, msg) {
        this.event = event;
        this.msg = msg;
    });

    /**
     * Abstracts access to browsers object store API which allows access
     * to indexedDB object store.
     * Provides a general error handling and supports handling multiple documents
     * at once.
     *
     * @name ObjectStore
     * @memberOf dff/idb
     * @constructor
     *
     * @param {Promise} openDBPromise Promise resolving when idb is opened successfull.
     * @param {string} name           Name of the object store.
     * @param {string} access         readwrite/readonly access attribute to object store.
     */
    dff.define('dff.idb.ObjectStore', function (openDBPromise, name, access) {
        this.openDBPromise = openDBPromise;
        this.name = name;
        this.access = access;
    });

    /**
     * Enum identifying how documents from objectstore should be returned.
     *
     * @name GET_RESOLVE_AS
     * @memberOf dff/idb.ObjectStore
     * @enum {string}
     *
     * @property {string} KEYS Return document keys only
     * @property {string} VALUES Return documents as values
     * @property {string} OBJECT Return documents in key value object
     */
    dff.idb.ObjectStore.GET_RESOLVE_AS = {
        KEYS: "keys",
        VALUES: "values",
        OBJECT: "object"
    };

    /**
     * Retrieves an IDBObjectStore instance from the indexedDB
     * within its transaction actions can be performed.
     *
     * @name getObjectStore
     * @methodOf dff/idb.ObjectStore
     * @instance
     *
     * @param {object} db IDBDatabase object to retrieve objectstore from.
     * @return {IDBObjectStore} objectstore to work with
     */
    dff.idb.ObjectStore.prototype.getObjectStore = function (db) {
        var self = this;

        var transaction = db.transaction(self.name, self.access);

        transaction.onerror = function (event) {
            var msg = "IndexedDBService - error getting object store " + db.name +
                " version " + db.version +
                " object store " + self.name;
            throw new dff.idb.IDBError(event, msg);
        };

        transaction.onabort = function (event) {
            var msg = "IndexedDBService - transaction is aborted " + db.name +
                " version " + db.version;

            throw new dff.idb.IDBError(event, msg);
        };
/*
        transaction.oncomplete = function (event) {
            var msg = "IndexedDBService - transaction completed " + db.name +
                " version " + db.version;

            console.log(msg, event);
        };
*/
        return transaction.objectStore(self.name);
    };

    /**
     * Counts documents in objectStore
     *
     * @name count
     * @memberOf dff/idb.ObjectStore
     * @instance
     *
     * @return {Promise} Promise that resolves or rejects depending on db request
     */
    dff.idb.ObjectStore.prototype.count = function () {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var objectStore = self.getObjectStore(db);
                var request = objectStore.count();
                return self.handleRequest(request);
            });
    };

    /**
     * Counts documents related to an objectStore index and given keyrange.
     *
     * @name countIndex
     * @memberOf dff/idb.ObjectStore
     * @instance
     *
     * @param {string} index - name of index that should be counted.
     * @param {Object} config - optional config that defines a keyrang.
     *
     * @return {Promise} Promise that resolves or rejects depending on db request.
     */
    dff.idb.ObjectStore.prototype.countIndex = function (index, config) {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var objectStore = self.getObjectStore(db);
                var keyRange = self.createKeyRange(config);
                var request = objectStore.index(index).count(keyRange);

                return self.handleRequest(request);
            });
    };

    /**
     * Adds given documents.
     *
     * @name add
     * @memberOf dff/idb.ObjectStore
     * @instance
     *
     * @param {Object|Array<Object>} data - one or multiple documents to add.
     * @param {Object|Array<Object>} key  - one or multiple keys for documents to add. Needs same order as data documents.
     *
     * @return {Promise} Promise that resolve or rejects depending on db requests.
     */
    dff.idb.ObjectStore.prototype.add = function (data, key) {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var objectStore = self.getObjectStore(db);
                var addPromises = [];
                var request;

                if (!Array.isArray(data)) {
                    data = [data];
                }

                if (!Array.isArray(key)) {
                    key = [key];
                }

                data.forEach(function (d, i) {
                    request = objectStore.add(d, key[i]);
                    addPromises.push(self.handleRequest(request));
                });

                return Promise.all(addPromises);
            });
    };

    /**
     * Adds or updates given document.
     *
     * @name put
     * @memberOf dff/idb.ObjectStore
     * @instance
     *
     * @param {Object|Array<Object>} data - one document to add or update.
     * @param {Object|Array<Object>} key  - one or multiple keys for documents to add. Needs same order as data documents.
     * @return {Promise} Promise that resolve or rejects depending on db request.
     */
    dff.idb.ObjectStore.prototype.put = function (data, key) {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var objectStore = self.getObjectStore(db);
                var addPromises = [];
                var request;

                if (!Array.isArray(data)) {
                    data = [data];
                }

                if (!Array.isArray(key)) {
                    key = [key];
                }

                data.forEach(function (d, i) {
                    request = objectStore.put(d, key[i]);
                    addPromises.push(self.handleRequest(request));
                });

                return Promise.all(addPromises);
            });
    };

    /**
     * @name put
     * @memberOf dff/idb.ObjectStore
     * @instance
     * @description adds or updates given documents
     *
     * @param {Object} documentsObject - An object each property contains a document and is also the key for a document.
     * @return {Promise} Promise that resolve or rejects depending on db request.
     */
    dff.idb.ObjectStore.prototype.putObject = function (documentsObject) {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var objectStore = self.getObjectStore(db);
                var addPromises = [];
                var request;
                var docValue;

                for (var docKey in documentsObject) {
                    docValue = documentsObject[docKey];

                    // functions cannot be serialized
                    if (typeof docValue !== "function") {
                        request = objectStore.put(docValue, docKey);
                        addPromises.push(self.handleRequest(request));
                    }
                }

                return Promise.all(addPromises);
            });
    };

    /**
     * @name get
     * @memberOf dff/idb.ObjectStore
     * @instance
     * @description gets one document by its key
     *
     * @param {Object} key - key of document.
     *
     * @return {Promise} Promise that resolve or rejects depending on db request.
     */
    dff.idb.ObjectStore.prototype.get = function (key) {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var objectStore = self.getObjectStore(db);
                var request = objectStore.get(key);
                return self.handleRequest(request);
            });
    };

    /**
     * @name getAll
     * @memberOf dff/idb.ObjectStore
     * @instance
     * @description
     * Gets all documents from objectstore or related index
     *
     * @param {Object}  config                  - optional parameters to configure retrieval.
     * @param {Number}  config.limit            - limits the amount of documents.
     * @param {Boolean} config.direction        - order of result.
     *                                            <ul>
     *                                            <li>'prev': reversed,</li>
     *                                            <li>'prevunique': keys reversed unique</li>
     *                                            <li>'nextunique': keys unique</li>
     *                                            </ul>
     * @param {Boolean} config.prev             - set to true if documents should be get in reversed order.
     * @param {Boolean} config.createKeyCursor  - set to true if only document keys should be returned.
     *                                            Works only with an index.
     *
     * @return {Promise} Promise that resolve or rejects depending on db request.
     */
    dff.idb.ObjectStore.prototype.getAll = function (config) {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var objectStore = self.getObjectStore(db);

                var createKeyCursor = false;
                var direction;
                var keyrange = self.createKeyRange(config);
                var limit;
                var request;
                var index;
                var resolveAs;

                if (config) {
                    if (config.index) {
                        index = objectStore.index(config.index);
                    }

                    if (config.resolveAs) {
                        resolveAs = config.resolveAs;
                    }

                    if (config.limit) {
                        limit = config.limit;
                    }

                    if (config.prev) {
                        direction = "prev";
                    }
                    else if (config.prevunique) {
                        direction = "prevunique";
                    }
                    else if (config.nextunique) {
                        direction = "nextunique";
                    }

                    if (config.createKeyCursor) {
                        createKeyCursor = !!config.createKeyCursor;
                    }
                }

                if (index) {
                    if (createKeyCursor) {
                        request = index.openKeyCursor(keyrange, direction);
                    }
                    else {
                        // distinction should not be required in modern browser.
                        // But chrome web view on TC75 requires it (2015-09-03).
                        if (keyrange && direction) {
                            request = index.openCursor(keyrange, direction);
                        }
                        else if (keyrange && !direction) {
                            request = index.openCursor(keyrange);
                        }
                        else if (!keyrange && direction) {
                            request = index.openCursor(null, direction);
                        }
                        else {
                            request = index.openCursor();
                        }
                    }
                }
                else {
                    // distinction should not be required in modern browser.
                    // But chrome web view on TC75 requires it (2015-09-03).
                    if (keyrange && direction) {
                        request = objectStore.openCursor(keyrange, direction);
                    }
                    else if (keyrange && !direction) {
                        request = objectStore.openCursor(keyrange);
                    }
                    else if (!keyrange && direction) {
                        request = objectStore.openCursor(null, direction);
                    }
                    else {
                        request = objectStore.openCursor();
                    }

                    /*
                    if (createKeyCursor) {
                        var msg = "IndexedDBService.getAll - key cursor only works with index";
                        self.log.warn(msg);
                    }
                    */
                }

                return self.getAllByCursor(request, limit, resolveAs);
            });
    };

    /**
     * @name getAllByCursor
     * @memberOf dff/idb.ObjectStore
     * @instance
     *
     * @description
     * Retrieves all documents from the given request till limit is reached.
     */
    dff.idb.ObjectStore.prototype.getAllByCursor = function (request, limit, resolveAs) {
        return new Promise(function (resolve, reject) {
            var cursor;
            var count = 0;
            var values = [];
            var keys = [];
            var result = {};

            request.onerror = function (event) {
                var msg = "IndexedDBService - error on object store:";
                reject(new dff.idb.IDBError(event, msg));
            };

            request.onsuccess = function (event) {
                var value;
                cursor = event.target.result;

                if (cursor && (!limit || count < limit)) {
                    // docu says value is primary key if keycursor but that's not true
                    if (typeof cursor.value !== "undefined") {
                        value = cursor.value;
                    }
                    else {
                        value = cursor.primaryKey;
                    }

                    values.push(value);
                    keys.push(cursor.key);

                    if (resolveAs === dff.idb.ObjectStore.GET_RESOLVE_AS.OBJECT) {
                        result[cursor.key] = value;
                    }

                    count++;
                    cursor.continue();
                }
                else {
                    if (resolveAs === dff.idb.ObjectStore.GET_RESOLVE_AS.KEYS) {
                        resolve(keys);
                    }
                    else if (resolveAs === dff.idb.ObjectStore.GET_RESOLVE_AS.OBJECT) {
                        resolve(result);
                    }
                    else {
                        resolve(values);
                    }
                }
            };
        });
    };

    /**
     * @name getKeys
     * @memberOf dff/idb.ObjectStore
     * @instance
     *
     * @description
     * Retrieves all documents from the given request till limit is reached.
     */
    dff.idb.ObjectStore.prototype.getKeys = function () {
        return this.getAll({ resolveAs: dff.idb.ObjectStore.GET_RESOLVE_AS.KEYS });
    };

    /**
     * @name clear
     * @memberOf dff/idb.ObjectStore
     * @instance
     * @description clears objectstore
     *
     * @return {Promise} Promise that resolve or rejects depending on db request.
     */
    dff.idb.ObjectStore.prototype.clear = function () {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var objectStore = self.getObjectStore(db);
                var request = objectStore.clear();
                return self.handleRequest(request);
            });
    };

    /**
     * @name delete
     * @memberOf dff/idb.ObjectStore
     * @instance
     * @description deleted one or multiple document(s) by its key(s)
     *
     * @param {Array<Object>} key()s - key(s) of document(s).
     *
     * @return {Promise} Promise that resolve or rejects depending on db request.
     */
    dff.idb.ObjectStore.prototype.delete = function (keys) {
        var self = this;

        return this.openDBPromise
            .then(function (db) {
                var deletePromises = [];
                var objectStore = self.getObjectStore(db);

                if (!Array.isArray(keys)) {
                    keys = [keys];
                }

                keys.forEach(function (key) {
                    var request = objectStore.delete(key);
                    deletePromises.push(self.handleRequest(request));
                });

                return Promise.all(deletePromises);
            });
    };

    dff.idb.ObjectStore.prototype.createKeyRange = function (config) {
        var keyRange = null;

        if (config) {
            if (typeof config.only !== "undefined") {
                keyRange = IDBKeyRange.only(config.only);
            }
            else if (typeof config.lowerBound !== "undefined") {
                keyRange = IDBKeyRange.lowerBound(config.lowerBound.lower, !!config.lowerBound.lowerOpen);
            }
            else if (typeof config.upperBound !== "undefined") {
                keyRange = IDBKeyRange.upperBound(config.upperBound.upper, !!config.upperBound.upperOpen);
            }
            else if (typeof config.bound !== "undefined") {
                keyRange = IDBKeyRange.bound(
                    config.bound.lower,
                    config.bound.upper,
                    !!config.bound.lowerOpen,
                    !!config.bound.upperOpen
                );
            }
        }

        return keyRange;
    };

    dff.idb.ObjectStore.prototype.handleRequest = function (request) {
        return new Promise(function (resolve, reject) {
            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function (event) {
                var msg = "IndexedDBService - error on object store:";

                reject(new dff.idb.IDBError(event, msg));
            };
        });
    };

    /**
     * @name toString
     * @memberOf dff/idb.ObjectStore
     * @instance
     *
     * @description
     * Return a string representation of an ObjectStore.
     *
     * @return {string} String representation of ObjectStore
     */
    dff.idb.ObjectStore.prototype.toString = function () {
        return this.name;
    };

    /**
     * @name dff.idb.IndexedDBService
     * @memberOf dff/idb
     *
     * @description
     * Abstracts working with browser IndexedDB API.
     * Handles opening and upgrade db.
     */
    dff.define('dff.idb.IndexedDBService', function (dbname, dbversion, upgradeInterceptors, log) {
        var self = this;

        this.dbname = dbname;
        this.dbversion = dbversion;
        this.log = log;
        this.upgradeInterceptors = upgradeInterceptors;

        // directly connect to db on new instance
        this.openDBPromise = this
            .openDB()
            .then(function (db) {
                self.db = db;
                return db;
            })
            .catch(function (reason) {
                self.log.error(reason);
                // just for logging
                throw reason;
            });
    });

    /**
     * @name dff.idb.IndexedDBService#getOpenDBPromise
     * @propertyOf dff.idb.IndexedDBService
     * @description returns the promise that resolves when db is open
     *
     * @return {Promise} promise that resolve when db is open
     */
    dff.idb.IndexedDBService.prototype.getOpenDBPromise = function () {
        return this.openDBPromise;
    };

    /**
     * @ngdoc property
     * @name dffAppServices.IndexedDBService#openDB
     * @propertyOf dffAppServices.IndexedDBService
     * @description opens indexeddb and calls interceptors if upgradeneeded.
     */
    dff.idb.IndexedDBService.prototype.openDB = function () {
        var self = this;

        return new Promise(function (resolve, reject) {
            var openRequest = indexedDB.open(self.dbname, self.dbversion);

            openRequest.onerror = function (event) {
                var msg = "IndexedDBService - error openening database " + self.dbname +
                    " version " + self.dbversion;
                reject(new dff.idb.IDBError(event, msg));
            };

            openRequest.onblocked = function (event) {
                var msg = "IndexedDBService - error openening database " + self.dbname +
                    " version " + self.dbversion +
                    " db is blocked";
                reject(new dff.idb.IDBError(event, msg));
            };

            openRequest.onsuccess = function () { // event
                var db = openRequest.result;
                // global db error handling
                db.onerror = function (event) {
                    var msg = "IndexedDBService - database error " + db.name +
                        " version " + db.version +
                        " error code " + event.target.errorCode;
                    self.log.error(msg, event);
                };

                db.onabort = function (event) {
                    var msg = "IndexedDBService - access of the database is aborted " + db.name +
                        " version " + db.version;
                    self.log.error(msg, event);
                };

                /*
                var msg = "IndexedDBService - opened database " +
                    db.name + " (" + db.version + ")" +
                    " object stores ";
                */

                // self.log.info(msg, db.objectStoreNames, event);

                resolve(db);
            };

            openRequest.onupgradeneeded = function (event) {
                var db = openRequest.result;

                db.onversionchange = function () { // event
                    /*
                    var msg = "IndexedDBService - onversionchange " +
                        " old version " + event.oldVersion +
                        " new version " + event.newVersion +
                        " closing db";
                    */
                    // self.log.info(msg, event);

                    db.close();
                };

                /*
                var msg = "IndexedDBService - onupgradeneeded " +
                    " old version " + event.oldVersion +
                    " new version " + event.newVersion;
                */
                // self.log.info(msg, event);

                self.upgradeInterceptors.forEach(function (upgradeInterceptor) {
                    upgradeInterceptor.onupgradeneeded(event);
                });
            };
        });
    };

    /**
     * @name dff.idb.IndexedDBService#getObjectStore
     * @methodOf dff.idb.IndexedDBService
     *
     * @description
     * Waits till db is opened and returns a promise that resolves with an instance
     * of `dff.idb.ObjectStore` that has access to the specified indexedDB ObjectStore.
     *
     * @param {string} name Name of object store.
     * @param {string} access Access mode for object store `readonly`/`readwrite`.
     *
     * @return {dff.idb.ObjectStore} New `dff.idb.ObjectStore` instance to access specified object store.
     */
    dff.idb.IndexedDBService.prototype.getObjectStore = function (name, access) {
        return new dff.idb.ObjectStore(this.openDBPromise, name, access);
    };


    dff.namespace('dff.idb.store');

    /**
     * @name dff.idb.store.SettingsInterceptor
     * @package dff.idb.store
     *
     * @description
     * Interceptor to create settings object store when indexedDB is created
     * or updated.
     *
     * @param {string} name Name of the settings objectstore. Defaults to "Settings" if not specified.
     */
    dff.define("dff.idb.store.SettingsInterceptor", function (name) {
        this.name = name || "Settings";
    });

    /**
     * @name dff.idb.store.SettingsInterceptor#onupgradeneeded
     * @package dff.idb.store
     * @methodOf dff.idb.store.SettingsInterceptor
     *
     * @description
     * Gets called by IndexedDBService when indexedDB needs an upgrade.
     *
     * @param {Object} event IDBVersionChangeEvent from IDBOpenDBRequest.
     */
    dff.idb.store.SettingsInterceptor.prototype.onupgradeneeded = function (event) {
        var db = event.target.result;

        if (!db.objectStoreNames.contains(this.name)) {
            db.createObjectStore(this.name);
        }
    };

    /**
     * @name dff.idb.store.DataInterceptor
     * @package dff.idb.store
     *
     * @description
     * Interceptor to create data object store when indexedDB is created
     * or updated.
     *
     * @param {string} name Name of the data objectstore. Defaults to "Settings" if not specified.
     */
    dff.define("dff.idb.store.DataInterceptor", function (name) {
        this.name = name || "Data";
    });

    /**
     * @name dff.idb.store.DataInterceptor#onupgradeneeded
     * @package dff.idb.store
     * @methodOf dff.idb.store.DataInterceptor
     *
     * @description
     * Gets called by IndexedDBService when indexedDB needs an upgrade.
     *
     * @param {Object} event IDBVersionChangeEvent from IDBOpenDBRequest.
     */
    dff.idb.store.DataInterceptor.prototype.onupgradeneeded = function (event) {
        var db = event.target.result;

        if (!db.objectStoreNames.contains(this.name)) {
            db.createObjectStore(this.name);
        }
    };

    /**
     * @namespace dff/iso/3166
     */
    dff.namespace('dff.iso.3166');

    /**
     * List of all ISO 3166 codes. Each list item holds
     * the country name, its number and abbreviations
     *
     * @name codes
     * @memberOf dff/iso/3166
     * @constant
     * @example
     * { "name": "BELIZE", "a2": "BZ", "a3": "BLZ", "number": "084" },
     */
    dff.define('dff.iso.3166.codes', [
            { "name": "AALAND ISLANDS", "a2": "AX", "a3": "ALA", "number": "248" },
            { "name": "AFGHANISTAN", "a2": "AF", "a3": "AFG", "number": "004" },
            { "name": "ALBANIA", "a2": "AL", "a3": "ALB", "number": "008" },
            { "name": "ALGERIA", "a2": "DZ", "a3": "DZA", "number": "012" },
            { "name": "AMERICAN SAMOA", "a2": "AS", "a3": "ASM", "number": "016" },
            { "name": "ANDORRA", "a2": "AD", "a3": "AND", "number": "020" },
            { "name": "ANGOLA", "a2": "AO", "a3": "AGO", "number": "024" },
            { "name": "ANGUILLA", "a2": "AI", "a3": "AIA", "number": "660" },
            { "name": "ANTARCTICA", "a2": "AQ", "a3": "ATA", "number": "010" },
            { "name": "ANTIGUA AND BARBUDA", "a2": "AG", "a3": "ATG", "number": "028" },
            { "name": "ARGENTINA", "a2": "AR", "a3": "ARG", "number": "032" },
            { "name": "ARMENIA", "a2": "AM", "a3": "ARM", "number": "051" },
            { "name": "ARUBA", "a2": "AW", "a3": "ABW", "number": "533" },
            { "name": "AUSTRALIA", "a2": "AU", "a3": "AUS", "number": "036" },
            { "name": "AUSTRIA", "a2": "AT", "a3": "AUT", "number": "040" },
            { "name": "AZERBAIJAN", "a2": "AZ", "a3": "AZE", "number": "031" },
            { "name": "BAHAMAS", "a2": "BS", "a3": "BHS", "number": "044" },
            { "name": "BAHRAIN", "a2": "BH", "a3": "BHR", "number": "048" },
            { "name": "BANGLADESH", "a2": "BD", "a3": "BGD", "number": "050" },
            { "name": "BARBADOS", "a2": "BB", "a3": "BRB", "number": "052" },
            { "name": "BELARUS", "a2": "BY", "a3": "BLR", "number": "112" },
            { "name": "BELGIUM", "a2": "BE", "a3": "BEL", "number": "056" },
            { "name": "BELIZE", "a2": "BZ", "a3": "BLZ", "number": "084" },
            { "name": "BENIN", "a2": "BJ", "a3": "BEN", "number": "204" },
            { "name": "BERMUDA", "a2": "BM", "a3": "BMU", "number": "060" },
            { "name": "BHUTAN", "a2": "BT", "a3": "BTN", "number": "064" },
            { "name": "BOLIVIA", "a2": "BO", "a3": "BOL", "number": "068" },
            { "name": "BOSNIA AND HERZEGOWINA", "a2": "BA", "a3": "BIH", "number": "070" },
            { "name": "BOTSWANA", "a2": "BW", "a3": "BWA", "number": "072" },
            { "name": "BOUVET ISLAND", "a2": "BV", "a3": "BVT", "number": "074" },
            { "name": "BRAZIL", "a2": "BR", "a3": "BRA", "number": "076" },
            { "name": "BRITISH INDIAN OCEAN TERRITORY", "a2": "IO", "a3": "IOT", "number": "086" },
            { "name": "BRUNEI DARUSSALAM", "a2": "BN", "a3": "BRN", "number": "096" },
            { "name": "BULGARIA", "a2": "BG", "a3": "BGR", "number": "100" },
            { "name": "BURKINA FASO", "a2": "BF", "a3": "BFA", "number": "854" },
            { "name": "BURUNDI", "a2": "BI", "a3": "BDI", "number": "108" },
            { "name": "CAMBODIA", "a2": "KH", "a3": "KHM", "number": "116" },
            { "name": "CAMEROON", "a2": "CM", "a3": "CMR", "number": "120" },
            { "name": "CANADA", "a2": "CA", "a3": "CAN", "number": "124" },
            { "name": "CAPE VERDE", "a2": "CV", "a3": "CPV", "number": "132" },
            { "name": "CAYMAN ISLANDS", "a2": "KY", "a3": "CYM", "number": "136" },
            { "name": "CENTRAL AFRICAN REPUBLIC", "a2": "CF", "a3": "CAF", "number": "140" },
            { "name": "CHAD", "a2": "TD", "a3": "TCD", "number": "148" },
            { "name": "CHILE", "a2": "CL", "a3": "CHL", "number": "152" },
            { "name": "CHINA", "a2": "CN", "a3": "CHN", "number": "156" },
            { "name": "CHRISTMAS ISLAND", "a2": "CX", "a3": "CXR", "number": "162" },
            { "name": "COCOS (KEELING) ISLANDS", "a2": "CC", "a3": "CCK", "number": "166" },
            { "name": "COLOMBIA", "a2": "CO", "a3": "COL", "number": "170" },
            { "name": "COMOROS", "a2": "KM", "a3": "COM", "number": "174" },
            { "name": "CONGO, Democratic Republic of (was Zaire)", "a2": "CD", "a3": "COD", "number": "180" },
            { "name": "CONGO, Republic of", "a2": "CG", "a3": "COG", "number": "178" },
            { "name": "COOK ISLANDS", "a2": "CK", "a3": "COK", "number": "184" },
            { "name": "COSTA RICA", "a2": "CR", "a3": "CRI", "number": "188" },
            { "name": "COTE D'IVOIRE", "a2": "CI", "a3": "CIV", "number": "384" },
            { "name": "CROATIA (local name: Hrvatska)", "a2": "HR", "a3": "HRV", "number": "191" },
            { "name": "CUBA", "a2": "CU", "a3": "CUB", "number": "192" },
            { "name": "CYPRUS", "a2": "CY", "a3": "CYP", "number": "196" },
            { "name": "CZECH REPUBLIC", "a2": "CZ", "a3": "CZE", "number": "203" },
            { "name": "DENMARK", "a2": "DK", "a3": "DNK", "number": "208" },
            { "name": "DJIBOUTI", "a2": "DJ", "a3": "DJI", "number": "262" },
            { "name": "DOMINICA", "a2": "DM", "a3": "DMA", "number": "212" },
            { "name": "DOMINICAN REPUBLIC", "a2": "DO", "a3": "DOM", "number": "214" },
            { "name": "ECUADOR", "a2": "EC", "a3": "ECU", "number": "218" },
            { "name": "EGYPT", "a2": "EG", "a3": "EGY", "number": "818" },
            { "name": "EL SALVADOR", "a2": "SV", "a3": "SLV", "number": "222" },
            { "name": "EQUATORIAL GUINEA", "a2": "GQ", "a3": "GNQ", "number": "226" },
            { "name": "ERITREA", "a2": "ER", "a3": "ERI", "number": "232" },
            { "name": "ESTONIA", "a2": "EE", "a3": "EST", "number": "233" },
            { "name": "ETHIOPIA", "a2": "ET", "a3": "ETH", "number": "231" },
            { "name": "FALKLAND ISLANDS (MALVINAS)", "a2": "FK", "a3": "FLK", "number": "238" },
            { "name": "FAROE ISLANDS", "a2": "FO", "a3": "FRO", "number": "234" },
            { "name": "FIJI", "a2": "FJ", "a3": "FJI", "number": "242" },
            { "name": "FINLAND", "a2": "FI", "a3": "FIN", "number": "246" },
            { "name": "FRANCE", "a2": "FR", "a3": "FRA", "number": "250" },
            { "name": "FRENCH GUIANA", "a2": "GF", "a3": "GUF", "number": "254" },
            { "name": "FRENCH POLYNESIA", "a2": "PF", "a3": "PYF", "number": "258" },
            { "name": "FRENCH SOUTHERN TERRITORIES", "a2": "TF", "a3": "ATF", "number": "260" },
            { "name": "GABON", "a2": "GA", "a3": "GAB", "number": "266" },
            { "name": "GAMBIA", "a2": "GM", "a3": "GMB", "number": "270" },
            { "name": "GEORGIA", "a2": "GE", "a3": "GEO", "number": "268" },
            { "name": "GERMANY", "a2": "DE", "a3": "DEU", "number": "276" },
            { "name": "GHANA", "a2": "GH", "a3": "GHA", "number": "288" },
            { "name": "GIBRALTAR", "a2": "GI", "a3": "GIB", "number": "292" },
            { "name": "GREECE", "a2": "GR", "a3": "GRC", "number": "300" },
            { "name": "GREENLAND", "a2": "GL", "a3": "GRL", "number": "304" },
            { "name": "GRENADA", "a2": "GD", "a3": "GRD", "number": "308" },
            { "name": "GUADELOUPE", "a2": "GP", "a3": "GLP", "number": "312" },
            { "name": "GUAM", "a2": "GU", "a3": "GUM", "number": "316" },
            { "name": "GUATEMALA", "a2": "GT", "a3": "GTM", "number": "320" },
            { "name": "GUINEA", "a2": "GN", "a3": "GIN", "number": "324" },
            { "name": "GUINEA-BISSAU", "a2": "GW", "a3": "GNB", "number": "624" },
            { "name": "GUYANA", "a2": "GY", "a3": "GUY", "number": "328" },
            { "name": "HAITI", "a2": "HT", "a3": "HTI", "number": "332" },
            { "name": "HEARD AND MC DONALD ISLANDS", "a2": "HM", "a3": "HMD", "number": "334" },
            { "name": "HONDURAS", "a2": "HN", "a3": "HND", "number": "340" },
            { "name": "HONG KONG", "a2": "HK", "a3": "HKG", "number": "344" },
            { "name": "HUNGARY", "a2": "HU", "a3": "HUN", "number": "348" },
            { "name": "ICELAND", "a2": "IS", "a3": "ISL", "number": "352" },
            { "name": "INDIA", "a2": "IN", "a3": "IND", "number": "356" },
            { "name": "INDONESIA", "a2": "ID", "a3": "IDN", "number": "360" },
            { "name": "IRAN (ISLAMIC REPUBLIC OF)", "a2": "IR", "a3": "IRN", "number": "364" },
            { "name": "IRAQ", "a2": "IQ", "a3": "IRQ", "number": "368" },
            { "name": "IRELAND", "a2": "IE", "a3": "IRL", "number": "372" },
            { "name": "ISRAEL", "a2": "IL", "a3": "ISR", "number": "376" },
            { "name": "ITALY", "a2": "IT", "a3": "ITA", "number": "380" },
            { "name": "JAMAICA", "a2": "JM", "a3": "JAM", "number": "388" },
            { "name": "JAPAN", "a2": "JP", "a3": "JPN", "number": "392" },
            { "name": "JORDAN", "a2": "JO", "a3": "JOR", "number": "400" },
            { "name": "KAZAKHSTAN", "a2": "KZ", "a3": "KAZ", "number": "398" },
            { "name": "KENYA", "a2": "KE", "a3": "KEN", "number": "404" },
            { "name": "KIRIBATI", "a2": "KI", "a3": "KIR", "number": "296" },
            { "name": "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF", "a2": "KP", "a3": "PRK", "number": "408" },
            { "name": "KOREA, REPUBLIC OF", "a2": "KR", "a3": "KOR", "number": "410" },
            { "name": "KUWAIT", "a2": "KW", "a3": "KWT", "number": "414" },
            { "name": "KYRGYZSTAN", "a2": "KG", "a3": "KGZ", "number": "417" },
            { "name": "LAO PEOPLE'S DEMOCRATIC REPUBLIC", "a2": "LA", "a3": "LAO", "number": "418" },
            { "name": "LATVIA", "a2": "LV", "a3": "LVA", "number": "428" },
            { "name": "LEBANON", "a2": "LB", "a3": "LBN", "number": "422" },
            { "name": "LESOTHO", "a2": "LS", "a3": "LSO", "number": "426" },
            { "name": "LIBERIA", "a2": "LR", "a3": "LBR", "number": "430" },
            { "name": "LIBYAN ARAB JAMAHIRIYA", "a2": "LY", "a3": "LBY", "number": "434" },
            { "name": "LIECHTENSTEIN", "a2": "LI", "a3": "LIE", "number": "438" },
            { "name": "LITHUANIA", "a2": "LT", "a3": "LTU", "number": "440" },
            { "name": "LUXEMBOURG", "a2": "LU", "a3": "LUX", "number": "442" },
            { "name": "MACAU", "a2": "MO", "a3": "MAC", "number": "446" },
            { "name": "MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF", "a2": "MK", "a3": "MKD", "number": "807" },
            { "name": "MADAGASCAR", "a2": "MG", "a3": "MDG", "number": "450" },
            { "name": "MALAWI", "a2": "MW", "a3": "MWI", "number": "454" },
            { "name": "MALAYSIA", "a2": "MY", "a3": "MYS", "number": "458" },
            { "name": "MALDIVES", "a2": "MV", "a3": "MDV", "number": "462" },
            { "name": "MALI", "a2": "ML", "a3": "MLI", "number": "466" },
            { "name": "MALTA", "a2": "MT", "a3": "MLT", "number": "470" },
            { "name": "MARSHALL ISLANDS", "a2": "MH", "a3": "MHL", "number": "584" },
            { "name": "MARTINIQUE", "a2": "MQ", "a3": "MTQ", "number": "474" },
            { "name": "MAURITANIA", "a2": "MR", "a3": "MRT", "number": "478" },
            { "name": "MAURITIUS", "a2": "MU", "a3": "MUS", "number": "480" },
            { "name": "MAYOTTE", "a2": "YT", "a3": "MYT", "number": "175" },
            { "name": "MEXICO", "a2": "MX", "a3": "MEX", "number": "484" },
            { "name": "MICRONESIA, FEDERATED STATES OF", "a2": "FM", "a3": "FSM", "number": "583" },
            { "name": "MOLDOVA, REPUBLIC OF", "a2": "MD", "a3": "MDA", "number": "498" },
            { "name": "MONACO", "a2": "MC", "a3": "MCO", "number": "492" },
            { "name": "MONGOLIA", "a2": "MN", "a3": "MNG", "number": "496" },
            { "name": "MONTSERRAT", "a2": "MS", "a3": "MSR", "number": "500" },
            { "name": "MOROCCO", "a2": "MA", "a3": "MAR", "number": "504" },
            { "name": "MOZAMBIQUE", "a2": "MZ", "a3": "MOZ", "number": "508" },
            { "name": "MYANMAR", "a2": "MM", "a3": "MMR", "number": "104" },
            { "name": "NAMIBIA", "a2": "NA", "a3": "NAM", "number": "516" },
            { "name": "NAURU", "a2": "NR", "a3": "NRU", "number": "520" },
            { "name": "NEPAL", "a2": "NP", "a3": "NPL", "number": "524" },
            { "name": "NETHERLANDS", "a2": "NL", "a3": "NLD", "number": "528" },
            { "name": "NETHERLANDS ANTILLES", "a2": "AN", "a3": "ANT", "number": "530" },
            { "name": "NEW CALEDONIA", "a2": "NC", "a3": "NCL", "number": "540" },
            { "name": "NEW ZEALAND", "a2": "NZ", "a3": "NZL", "number": "554" },
            { "name": "NICARAGUA", "a2": "NI", "a3": "NIC", "number": "558" },
            { "name": "NIGER", "a2": "NE", "a3": "NER", "number": "562" },
            { "name": "NIGERIA", "a2": "NG", "a3": "NGA", "number": "566" },
            { "name": "NIUE", "a2": "NU", "a3": "NIU", "number": "570" },
            { "name": "NORFOLK ISLAND", "a2": "NF", "a3": "NFK", "number": "574" },
            { "name": "NORTHERN MARIANA ISLANDS", "a2": "MP", "a3": "MNP", "number": "580" },
            { "name": "NORWAY", "a2": "NO", "a3": "NOR", "number": "578" },
            { "name": "OMAN", "a2": "OM", "a3": "OMN", "number": "512" },
            { "name": "PAKISTAN", "a2": "PK", "a3": "PAK", "number": "586" },
            { "name": "PALAU", "a2": "PW", "a3": "PLW", "number": "585" },
            { "name": "PALESTINIAN TERRITORY, Occupied", "a2": "PS", "a3": "PSE", "number": "275" },
            { "name": "PANAMA", "a2": "PA", "a3": "PAN", "number": "591" },
            { "name": "PAPUA NEW GUINEA", "a2": "PG", "a3": "PNG", "number": "598" },
            { "name": "PARAGUAY", "a2": "PY", "a3": "PRY", "number": "600" },
            { "name": "PERU", "a2": "PE", "a3": "PER", "number": "604" },
            { "name": "PHILIPPINES", "a2": "PH", "a3": "PHL", "number": "608" },
            { "name": "PITCAIRN", "a2": "PN", "a3": "PCN", "number": "612" },
            { "name": "POLAND", "a2": "PL", "a3": "POL", "number": "616" },
            { "name": "PORTUGAL", "a2": "PT", "a3": "PRT", "number": "620" },
            { "name": "PUERTO RICO", "a2": "PR", "a3": "PRI", "number": "630" },
            { "name": "QATAR", "a2": "QA", "a3": "QAT", "number": "634" },
            { "name": "REUNION", "a2": "RE", "a3": "REU", "number": "638" },
            { "name": "ROMANIA", "a2": "RO", "a3": "ROU", "number": "642" },
            { "name": "RUSSIAN FEDERATION", "a2": "RU", "a3": "RUS", "number": "643" },
            { "name": "RWANDA", "a2": "RW", "a3": "RWA", "number": "646" },
            { "name": "SAINT HELENA", "a2": "SH", "a3": "SHN", "number": "654" },
            { "name": "SAINT KITTS AND NEVIS", "a2": "KN", "a3": "KNA", "number": "659" },
            { "name": "SAINT LUCIA", "a2": "LC", "a3": "LCA", "number": "662" },
            { "name": "SAINT PIERRE AND MIQUELON", "a2": "PM", "a3": "SPM", "number": "666" },
            { "name": "SAINT VINCENT AND THE GRENADINES", "a2": "VC", "a3": "VCT", "number": "670" },
            { "name": "SAMOA", "a2": "WS", "a3": "WSM", "number": "882" },
            { "name": "SAN MARINO", "a2": "SM", "a3": "SMR", "number": "674" },
            { "name": "SAO TOME AND PRINCIPE", "a2": "ST", "a3": "STP", "number": "678" },
            { "name": "SAUDI ARABIA", "a2": "SA", "a3": "SAU", "number": "682" },
            { "name": "SENEGAL", "a2": "SN", "a3": "SEN", "number": "686" },
            { "name": "SERBIA AND MONTENEGRO", "a2": "CS", "a3": "SCG", "number": "891" },
            { "name": "SEYCHELLES", "a2": "SC", "a3": "SYC", "number": "690" },
            { "name": "SIERRA LEONE", "a2": "SL", "a3": "SLE", "number": "694" },
            { "name": "SINGAPORE", "a2": "SG", "a3": "SGP", "number": "702" },
            { "name": "SLOVAKIA", "a2": "SK", "a3": "SVK", "number": "703" },
            { "name": "SLOVENIA", "a2": "SI", "a3": "SVN", "number": "705" },
            { "name": "SOLOMON ISLANDS", "a2": "SB", "a3": "SLB", "number": "090" },
            { "name": "SOMALIA", "a2": "SO", "a3": "SOM", "number": "706" },
            { "name": "SOUTH AFRICA", "a2": "ZA", "a3": "ZAF", "number": "710" },
            { "name": "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS", "a2": "GS", "a3": "SGS", "number": "239" },
            { "name": "SPAIN", "a2": "ES", "a3": "ESP", "number": "724" },
            { "name": "SRI LANKA", "a2": "LK", "a3": "LKA", "number": "144" },
            { "name": "SUDAN", "a2": "SD", "a3": "SDN", "number": "736" },
            { "name": "SURINAME", "a2": "SR", "a3": "SUR", "number": "740" },
            { "name": "SVALBARD AND JAN MAYEN ISLANDS", "a2": "SJ", "a3": "SJM", "number": "744" },
            { "name": "SWAZILAND", "a2": "SZ", "a3": "SWZ", "number": "748" },
            { "name": "SWEDEN", "a2": "SE", "a3": "SWE", "number": "752" },
            { "name": "SWITZERLAND", "a2": "CH", "a3": "CHE", "number": "756" },
            { "name": "SYRIAN ARAB REPUBLIC", "a2": "SY", "a3": "SYR", "number": "760" },
            { "name": "TAIWAN", "a2": "TW", "a3": "TWN", "number": "158" },
            { "name": "TAJIKISTAN", "a2": "TJ", "a3": "TJK", "number": "762" },
            { "name": "TANZANIA, UNITED REPUBLIC OF", "a2": "TZ", "a3": "TZA", "number": "834" },
            { "name": "THAILAND", "a2": "TH", "a3": "THA", "number": "764" },
            { "name": "TIMOR-LESTE", "a2": "TL", "a3": "TLS", "number": "626" },
            { "name": "TOGO", "a2": "TG", "a3": "TGO", "number": "768" },
            { "name": "TOKELAU", "a2": "TK", "a3": "TKL", "number": "772" },
            { "name": "TONGA", "a2": "TO", "a3": "TON", "number": "776" },
            { "name": "TRINIDAD AND TOBAGO", "a2": "TT", "a3": "TTO", "number": "780" },
            { "name": "TUNISIA", "a2": "TN", "a3": "TUN", "number": "788" },
            { "name": "TURKEY", "a2": "TR", "a3": "TUR", "number": "792" },
            { "name": "TURKMENISTAN", "a2": "TM", "a3": "TKM", "number": "795" },
            { "name": "TURKS AND CAICOS ISLANDS", "a2": "TC", "a3": "TCA", "number": "796" },
            { "name": "TUVALU", "a2": "TV", "a3": "TUV", "number": "798" },
            { "name": "UGANDA", "a2": "UG", "a3": "UGA", "number": "800" },
            { "name": "UKRAINE", "a2": "UA", "a3": "UKR", "number": "804" },
            { "name": "UNITED ARAB EMIRATES", "a2": "AE", "a3": "ARE", "number": "784" },
            { "name": "UNITED KINGDOM", "a2": "GB", "a3": "GBR", "number": "826" },
            { "name": "UNITED STATES", "a2": "US", "a3": "USA", "number": "840" },
            { "name": "UNITED STATES MINOR OUTLYING ISLANDS", "a2": "UM", "a3": "UMI", "number": "581" },
            { "name": "URUGUAY", "a2": "UY", "a3": "URY", "number": "858" },
            { "name": "UZBEKISTAN", "a2": "UZ", "a3": "UZB", "number": "860" },
            { "name": "VANUATU", "a2": "VU", "a3": "VUT", "number": "548" },
            { "name": "VATICAN CITY STATE (HOLY SEE)", "a2": "VA", "a3": "VAT", "number": "336" },
            { "name": "VENEZUELA", "a2": "VE", "a3": "VEN", "number": "862" },
            { "name": "VIET NAM", "a2": "VN", "a3": "VNM", "number": "704" },
            { "name": "VIRGIN ISLANDS (BRITISH)", "a2": "VG", "a3": "VGB", "number": "092" },
            { "name": "VIRGIN ISLANDS (U.S.)", "a2": "VI", "a3": "VIR", "number": "850" },
            { "name": "WALLIS AND FUTUNA ISLANDS", "a2": "WF", "a3": "WLF", "number": "876" },
            { "name": "WESTERN SAHARA", "a2": "EH", "a3": "ESH", "number": "732" },
            { "name": "YEMEN", "a2": "YE", "a3": "YEM", "number": "887" },
            { "name": "ZAMBIA", "a2": "ZM", "a3": "ZMB", "number": "894" },
            { "name": "ZIMBABWE", "a2": "ZW", "a3": "ZWE", "number": "716" }
        ]);

    /**
     * Provides access and search function to ISO 3166 codes.
     *
     * @name CodeService
     * @memberOf dff/iso/3166
     * @constructs
     */
    dff.define('dff.iso.3166.CodeService', function () {
        var self = {};
        var noregex = /^[0-9]{3}$/;

        /**
         * Searches through ISO 3166 country code list and returns code object.
         * Any property of a code object can be given: number, a2, a3, name
         *
         * @name getCountryCode
         * @memberOf dff/iso/3166.CodeService
         * @function
         * @instance
         *
         * @param {string} code Code to search properties of code objects for.
         * @return {Object} Code object found for given code or undefined if nothing is found.
         */
        self.getCountryCode= function (code) {
            if (typeof code === "string") {

                // search by number
                if (noregex.test(code)) {
                    return _.find(dff.iso[3166].codes, function (isocode) {
                        return isocode.number === code;
                    });
                }
                // search by a2
                else if (code.length === 2) {
                    return _.find(dff.iso[3166].codes, function (isocode) {
                        return isocode.a2 === code;
                    });
                }
                // search by a3
                else if (code.length === 3) {
                    return _.find(dff.iso[3166].codes, function (isocode) {
                        return isocode.a3 === code;
                    });
                }
                // try search by name caseinsensitive
                else {
                    var codelc = code.toLowerCase();
                    return _.find(dff.iso[3166].codes, function (isocode) {
                        return isocode.name.toLowerCase() === codelc;
                    });
                }
            }
            else if (typeof code === "number") {
                return _.find(dff.iso[3166].codes, function (isocode) {
                    return parseInt(isocode.number) === code;
                });
            }
        };

        return self;
    });
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

    dff.namespace('dff.settings');

    /**
     * @name dff.settings.SettingsService
     * @description
     * Provides access to application settings.
     * Loads settings from storage async. Afterwards it provides
     * sync access.
     *
     * @param {Object} dffSettingsStore Store to load from and save settings to.
     * @param {Object} dffDefaultSettings Default settings to use.
     */
    dff.define('dff.settings.SettingsService',
        function (dffSettingsStore, dffDefaultSettings) {
            var self = {
                settings: {}
            };

            self.startPromise = dffSettingsStore
                .getAll({resolveAs: dff.idb.ObjectStore.GET_RESOLVE_AS.OBJECT})
                .then(function (settings) {
                    self.settings = _.assign({}, dffDefaultSettings, settings);
                });

            self.startService = function () {
                return self.startPromise;
            };

            self.clear = function () {
                self.settings = {};
                return dffSettingsStore.clear();
            };

            self.reset = function () {
                self.settings = _.assign({}, dffDefaultSettings);
                return self.save();
            };

            self.save = function () {
                return dffSettingsStore
                    .clear()
                    .then(function () {
                        return dffSettingsStore
                            .putObject(self.settings);
                    });
            };

            return self;
        }
    );

    dff.namespace('dff.storage');

    dff.define('dff.storage.StorageService', function (window) {
        var self = {};

        self.getStorageInfo = function () {
            var tsp = new Promise(function (resolve, reject) {
                window.navigator.webkitTemporaryStorage.queryUsageAndQuota (
                    function(usedBytes, grantedBytes) {
                        resolve({ used: usedBytes, granted: grantedBytes});
                    },
                    function(reason) {
                        reject(reason);
                    }
                );
            });

            var psp = new Promise(function (resolve, reject) {
                window.navigator.webkitPersistentStorage.queryUsageAndQuota (
                    function(usedBytes, grantedBytes) {
                        resolve({ used: usedBytes, granted: grantedBytes});
                    },
                    function(reason) {
                        reject(reason);
                    }
                );
            });

            return Promise.all([tsp, psp]);
        };

        return self;
    });

/**
 * @namespace dff/util
 */
dff.namespace('dff.util');

/**
 * @namespace dff/util/guid
 */
dff.define('dff.util.guid', {
    /**
     * Creates a S4 value
     *
     * @name S4
     * @memberOf dff/util/guid
     * @function
     *
     * @returns {String} S4 value.
     */
    S4: function () {
        return (((1 + Math.random()) * 0x10000) | 0)
            .toString(16)
            .substring(1);
    },
    /**
     * Generates a GUID.
     *
     * @name generate
     * @memberOf dff/util/guid
     * @function
     *
     * @returns {String} GUID.
     */
    generate: function () {
        var guid = (
                    this.S4() + this.S4() + "-" + this.S4() + "-4" +
                    this.S4().substr(0, 3) + "-" + this.S4() + "-" +
                    this.S4() + this.S4() + this.S4()
                ).toLowerCase();

        return guid;
    }
});

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

dff.namespace('dff.app.cordova.connection');

dff.define('dff.app.cordova.connection.ConnectionService', function (window, dffLoggingService, connectionChangeListener, serverConnectionChangeListener) {
    var connection;
    var serverConnected;
    var self = {};

    connectionChangeListener = connectionChangeListener || [];
    serverConnectionChangeListener = serverConnectionChangeListener || [];

    var onConnectionChangePromise = Promise.resolve();
    var onServerConnectionChangePromise = Promise.resolve();

    function onDeviceReady () {
        if (window.navigator.connection) {
            window.document.addEventListener("online", self.checkConnection, false);
            window.document.addEventListener("offline", self.checkConnection, false);

            self.checkConnection();
        }
        else {
            dffLoggingService
                .error("dffAppConnectionService:",
                       "cordova connection plugin not available");
        }
    }

    function onConnectionChange(connection) {
        onConnectionChangePromise = onConnectionChangePromise
            .then(function () {
                return connectionChangeListener.reduce(function (prev, cur) {
                    return prev
                        .then(function () {
                            return cur.onConnectionChange(connection);
                        });
                }, Promise.resolve());
            });

        return onConnectionChangePromise;
    }

    function onServerConnectionChange(hasServerConnection) {
        onServerConnectionChangePromise = onServerConnectionChangePromise
            .then(function () {
                return serverConnectionChangeListener.reduce(function (prev, cur) {
                    return prev
                        .then(function () {
                            return cur.onServerConnectionChange(hasServerConnection);
                        });
                }, Promise.resolve());
            });

        return onServerConnectionChangePromise;
    }

    self.addConnectionChangeListener = function (listener) {
        connectionChangeListener.push(listener);
    };

    self.addServerConnectionChangeListener = function (listener) {
        serverConnectionChangeListener.push(listener);
    };

    self.checkConnection = function () {
        var lastConnection = connection;
        var networkState = navigator.connection.type;

        dffLoggingService
            .info("dffAppConnectionService - ",
                  "checkConnection", networkState);

        if (networkState === Connection.WIFI) {
            connection = "WLAN";
        }
        else if (networkState === Connection.NONE) {
            connection = Connection.NONE;
            serverConnected = false;
        }
        // what about unknown ?
        else {
            connection = "GPRS";
        }

        if (lastConnection !== connection) {
            dffLoggingService
                .info("dffAppConnectionService - ",
                       "new connection:", connection);

            return onConnectionChange(connection);
        }
        else {
            return Promise.resolve("connection has not changed");
        }
    };

    self.getConnection = function () {
        return connection;
    };

    self.setConnection = function (con) {
        if (connection !== con) {
            connection = con;
            return onConnectionChange(connection);
        }
        else {
            return Promise.resolve("connection has not changed");
        }
    };

    self.hasConnection = function () {
        return connection && connection !== Connection.NONE;
    };

    self.setServerConnected = function (isConnected) {
        serverConnected = isConnected;
        return onServerConnectionChange(isConnected);
    };

    self.isServerConnected = function () {
        return serverConnected;
    };

    self.hasServerConnection = function () {
        return self.hasConnection() && serverConnected;
    };

    self.startService = function () {
        window.document.addEventListener("deviceready", onDeviceReady, false);
    };

    self.stopService = function () {
         window.document.removeEventListener("deviceready", onDeviceReady, false);
         window.document.removeEventListener("online", self.checkConnection, false);
         window.document.removeEventListener("offline", self.checkConnection, false);
    };

    return self;
});


    dff.namespace('dff.app.cordova.file');

    dff.define('dff.app.cordova.file.FileError', function (fileError, msg, desc) {
        this.fileError = fileError;
        this.msg = msg;
        this.desc = desc;
    });

    /**
     * @name dff.app.cordova.file.FileService
     */
    dff.define('dff.app.cordova.file.FileService', function () {});

    dff.app.cordova.file.FileService.getFileErrorDesc = function (fileError) {
        var errDesc = "";

        switch (fileError.code) {
            case FileError.NOT_FOUND_ERR:
                errDesc = "NOT_FOUND_ERR";
                break;
            case FileError.SECURITY_ERR:
                errDesc = "SECURITY_ERR";
                break;
            case FileError.ABORT_ERR:
                errDesc = "ABORT_ERR";
                break;
            case FileError.NOT_READABLE_ERR:
                errDesc = "NOT_READABLE_ERR";
                break;
            case FileError.ENCODING_ERR:
                errDesc = "ENCODING_ERR";
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
                errDesc = "NO_MODIFICATION_ALLOWED_ERR";
                break;
            case FileError.INVALID_STATE_ERR:
                errDesc = "INVALID_STATE_ERR";
                break;
            case FileError.SYNTAX_ERR:
                errDesc = "SYNTAX_ERR";
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                errDesc = "INVALID_MODIFICATION_ERR";
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                errDesc = "QUOTA_EXCEEDED_ERR";
                break;
            case FileError.TYPE_MISMATCH_ERR:
                errDesc = "TYPE_MISMATCH_ERR";
                break;
            case FileError.PATH_EXISTS_ERR:
                errDesc = "PATH_EXISTS_ERR";
                break;
        }

        return errDesc;
    };

    dff.app.cordova.file.FileService.resolveLocalFileSystemURL = function (window, url) {
        return new Promise(function (resolve, reject) {
            window.resolveLocalFileSystemURL(
                url,
                function (dirEntry) {
                    resolve(dirEntry);
                },
                function (reason) {
                    reject(new dff.app.cordova.file.FileError(
                        reason,
                        "error resolve filesystem " + url,
                        dff.app.cordova.file.FileService
                            .getFileErrorDesc(reason)
                    ));
                });
        });
    };

    dff.app.cordova.file.FileService.getDirectory = function (dir, parent, create, exclusive) {
        var paths = dir.split(/\/|\\/);

        return paths.reduce(function (prev, cur) {
            if (cur) {
                return prev
                    .then(function (par) {
                        return new Promise(function (resolve, reject) {
                            par.getDirectory(cur, { create: create, exclusive: exclusive},
                                function (dirEntry) {
                                    resolve(dirEntry);
                                }, function (reason) {
                                    reject(new dff.app.cordova.file.FileError(
                                        reason,
                                        "error getting directory " + dir,
                                        dff.app.cordova.file.FileService
                                            .getFileErrorDesc(reason)
                                    ));
                                });
                        });
                    });
            }
            else {
                return prev;
            }
        }, Promise.resolve(parent));
    };

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
}());
