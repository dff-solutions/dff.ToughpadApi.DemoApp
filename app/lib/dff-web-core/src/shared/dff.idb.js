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
