
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

        this.$get = function ($injector, $window, dffLoggingService) {
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
        };
    })
    .factory('dffAppConnectionListener', function ($rootScope) {
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
    })
    .config(function (dffAppConnectionServiceProvider) {
        // directly add listener to service to provide angular functionality
        dffAppConnectionServiceProvider.addConnectionChangeListener('dffAppConnectionListener');
        dffAppConnectionServiceProvider.addServerConnectionChangeListener('dffAppConnectionListener');
    });
