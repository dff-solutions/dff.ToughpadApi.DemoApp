var isStarted = false,
    isSending = false,
    hasServerConnection = false,
    interval = 1000,
    idbSettings,
    messageOutgoingIndex, // object store index to use
    access = "readwrite", // access for objectstore
    url, // url to send tickets to
    timeout, // timeout for xhr requests
    db,
    openDBPromise = Promise.reject("db not yet opened"); // to wait till db is opened

function MessageBoxSentShuttlesWorkerDBError(msg, event) {
    this.msg = msg;
    this.event = event;
}

MessageBoxSentShuttlesWorkerDBError.prototype.toString = function () {
    return this.msg + this.event.target.error;
};

function openDB() {
    return new Promise(function (resolve, reject) {
        var openRequest = this.indexedDB.open(idbSettings.IDBName); // open as is no version

        openRequest.onerror = function (event) {
            var msg = "MessageBoxSentShuttlesWorker - error openening database " + idbSettings.IDBName;
            reject({msg: msg, event: event});
        };

        openRequest.onblocked = function (event) {
            var msg = "MessageBoxSentShuttlesWorker - error openening database " + idbSettings.IDBName +
                " db is blocked";

            reject({msg: msg, event: event});
        };

        openRequest.onsuccess = function (event) {
            db = openRequest.result;
            // global db error handling
            db.onerror = function (event) {
                var msg = "MessageBoxSentShuttlesWorker - database error " + db.name +
                    " version " + db.version +
                    " error code " + event.target.errorCode;
                throw new MessageBoxSentShuttlesWorkerDBError(msg, event);
            };

            db.onabort = function (event) {
                var msg = "MessageBoxSentShuttlesWorker - access of the database is aborted " + db.name +
                    " version " + db.version;
                throw new MessageBoxSentShuttlesWorkerDBError(msg, event);
            };

            var msg = "MessageBoxSentShuttlesWorker - opened database " +
                db.name + " (" + db.version + ")" +
                " object stores ";

            console.debug(msg, db.objectStoreNames, event);

            resolve(db);
        };
    });
}

function getObjectStore(osName) {
    var transaction = db.transaction(osName, access);

    transaction.onerror = function (event) {
        var msg = "MessageBoxSentShuttlesWorker - error getting object store " + db.name +
            " version " + db.version +
            " object store " + osName;

        throw new MessageBoxSentShuttlesWorkerDBError(msg, event);
    };

    transaction.onabort = function (event) {
        var msg = "MessageBoxSentShuttlesWorker - transaction is aborted " + db.name +
            " version " + db.version +
            " object store " + osName;

        throw new MessageBoxSentShuttlesWorkerDBError(msg, event);
    };

    return transaction.objectStore(osName);
}

function handleRequest(request) {
    return new Promise(function (resolve, reject) {
        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function (event) {
            var msg = "IndexedDBService - error on object store:";
            console.error(msg, event);

            reject(event);
        };
    });
}

var log = {};

log.concatArgs = function (args) {
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

log.addLineToLogfile = function (text, type) {
    var logline = {
        timestamp: new Date(),
        type:      type,
        content:   text
    };

    return openDBPromise
        .then(function () {
            var os = getObjectStore(idbSettings.LogfileStore);
            var request = os.add(logline);
            return handleRequest(request);
        })
        .catch(function (reason) {
            console.error(reason);
        });
};

log.log = function () {
    console.log.apply(console, arguments);
    return log.addLineToLogfile(this.concatArgs(arguments), "LOG");
};

log.info = function () {
    console.info.apply(console, arguments);
    return log.addLineToLogfile(this.concatArgs(arguments), "INFO");
};

log.debug = function () {
    console.debug.apply(console, arguments);
};

log.warn = function () {
    console.warn.apply(console, arguments);
    return log.addLineToLogfile(this.concatArgs(arguments), "WARN");
};

log.error = function () {
    console.error.apply(console, arguments);
    return log.addLineToLogfile(this.concatArgs(arguments), "ERROR");
};

/**
 * @ngdoc object
 * @name MessageBoxSentShuttlesWorker
 * @description
 * Versendet shuttles in einem extra WebWorker-Thread.
 * Versucht alle shuttles zu senden.
 * Benachrichtigt ob ein shuttle erfolgreich gesendet wurde.
 */
this.onmessage = function (e) {
    var tmpTimeout = parseInt(e.data.timeout);

    if (!isNaN(tmpTimeout)) {
        timeout = tmpTimeout;
    }

    if (e.data.idbSettings) {
        // if different db, works also for first message
        if (db && e.data.idbSettings.IDBName !== idbSettings.IDBName) {
            db.close();
        }

        idbSettings = e.data.idbSettings;

        if (!db) {
            openDBPromise = openDB();
        }
    }

    if (typeof e.data.url === "string") {
        url = e.data.url;
    }

    if (typeof e.data.messageOutgoingIndex === "string") {
        messageOutgoingIndex = e.data.messageOutgoingIndex;
    }

    if (typeof e.data.interval === "number") {
        interval = e.data.interval;
    }

    switch (e.data.action) {
        case "start":
            if (!isStarted) {
                isStarted = true;
                log.log("MessageBoxSentShuttlesWorker started, is sending: " + isSending);

                // if still sending a ticked, sendNextShuttle calls itself again.
                if (!isSending) {
                    sendNextShuttle();
                }
            }
            break;
        case "stop":
            isStarted = false;
            hasServerConnection = false;
            log.log("MessageBoxSentShuttlesWorker stopped");
            break;
        default:
            log.warn("MessageBoxSentShuttlesWorker unknown action: " + e.data.action);
            break;
    }
};

function getNextShuttle() {
    return openDBPromise
        .then(function () {
            var os = getObjectStore(idbSettings.MessageOutgoingStore);

            return new Promise(function (resolve, reject) {
                var index = os.index(messageOutgoingIndex);
                var request = index.openCursor();

                request.onerror = function (event) {
                    var msg = "IndexedDBService - error on object store:";
                    log.error(msg, JSON.stringify(event));

                    reject(event);
                };

                request.onsuccess = function (event) {
                    // get only the next shuttle
                    var result = event.target.result;
                    if (!result) {
                        resolve();
                    }
                    else {
                        resolve(result.value);
                    }
                };
            });
        });
}

function deleteShuttle(key) {
    return openDBPromise
        .then(function () {
            var os = getObjectStore(idbSettings.MessageOutgoingStore);
            var request = os.delete(key);
            return handleRequest(request);
        });
}

function sendNextShuttle() {
    isSending = true;

    return getNextShuttle()
        .then(function (shuttle) {
            if (shuttle) {
                log.log("Send shuttle " +
                    shuttle.Type + " " +
                    shuttle.MessageId +
                    " to " +
                    url
                );

                return sendShuttle(shuttle, url);
            }
            else {
                // no shuttle in store wait some time
                return new Promise(function (resolve) {
                    log.debug('MessageBoxSentShuttlesWorker looking for next shuttle in ' + interval);
                    setTimeout(function () {
                        resolve();
                    }, interval);
                });
            }
        })
        .then(function (shuttleResult) {
            if (shuttleResult) {
                var post = false;
                var isOkay = false;

                log.debug("MessageBoxSentShuttlesWorker: Shuttle " +
                    shuttleResult.shuttle.MessageId +
                    " versendet! Typ: " + shuttleResult.shuttle.Type
                );

                shuttleResult.response.forEach(function (response) {
                    log.debug("MessageBoxSentShuttlesWorker: Response " +
                        response.Type
                    );

                    if (response.Type !== "OK") {
                        post = true;
                    }
                    else {
                        isOkay = true;
                    }
                });

                if (!hasServerConnection || post) {
                    postMessage(shuttleResult);
                }

                hasServerConnection = true;

                if (isOkay) {
                    return deleteShuttle(shuttleResult.shuttle.MessageId);
                }
                else {
                    return Promise.reject("Server response not OK.");
                }
            }
        })
        .catch(function (reason) {
            hasServerConnection = false;
            log.error('MessageBoxSentShuttlesWorker error sending shuttle ' + reason.shuttle.Type + ' ' + reason.shuttle.MessageId + ' (BuildingTime: ' + reason.shuttle.BuildingTime + '): ' + JSON.stringify(reason.msg));
            postMessage(reason);

            // slow down retry on error
            return new Promise(function (resolve) {
                var waitingInterval = interval * 60;
                log.debug('MessageBoxSentShuttlesWorker retry sending shuttle after ' + waitingInterval);
                setTimeout(function () {
                    resolve();
                }, waitingInterval);
            });
        })
        .then(function () {
            isSending = false;

            if (isStarted) {
                return sendNextShuttle();
            }
        });
}

function sendShuttle(sentShuttle, url) {
    return new Promise(function (resolve, reject) {
        sentShuttle.InProgress = true;
        var sentShuttleString = JSON.stringify(sentShuttle);

        var sentShuttleRequest = new XMLHttpRequest();
        sentShuttleRequest.open('POST', url, true);
        sentShuttleRequest.setRequestHeader('Content-Type', 'application/json');

        if (typeof timeout === 'number') {
            sentShuttleRequest.timeout = timeout;
        }

        sentShuttleRequest.onreadystatechange = function () {
            if (sentShuttleRequest.readyState === 4) {
                if (sentShuttleRequest.status === 200) {
                    // repsonse type is not set but asume it's JSON.
                    // If not JSON.parse throws an exception.
                    var response = JSON.parse(sentShuttleRequest.response);

                    resolve({
                        shuttle:          sentShuttle,
                        response:         response,
                        serverConnection: true
                    });
                }
                else {
                    // on error we don't have a valid response. So don't parse it to JSON.
                    reject({
                        msg:              "error sending shuttle",
                        shuttle:          sentShuttle,
                        response:         sentShuttleRequest.response,
                        status:           sentShuttleRequest.status,
                        error:            true,
                        serverConnection: false
                    });
                }
            }
            // else {
            //     log.debug('unkown readyState: ' + sentShuttleRequest.readyState);
            // }
        };

        sentShuttleRequest.send(sentShuttleString);
    });
}
