
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
