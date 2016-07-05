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