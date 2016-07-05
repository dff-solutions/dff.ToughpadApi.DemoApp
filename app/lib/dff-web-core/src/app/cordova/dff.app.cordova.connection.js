
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

