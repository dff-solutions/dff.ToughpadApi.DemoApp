
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
    .factory('dffIncomingMessageBroadcaster', function ($rootScope) {
        var self = {};

        self.onIncomingMessage = function (message) {
            $rootScope.$broadcast("incomingMessage", message);
        };

        return self;
    })
    .provider('dffShuttleService', function () {
        var messageIncomingListeners = [];

        this.addMessageIncomingListener = function(Listener) {
            messageIncomingListeners.push(Listener);
        };

        this.$get = function (
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
        };
    })
    .config(function (dffShuttleServiceProvider) {
        dffShuttleServiceProvider
            .addMessageIncomingListener('dffIncomingMessageBroadcaster');

        // circular dependency
        //dffAppConnectionServiceProvider
        //    .addConnectionChangeListener('dffShuttleService');
    })
    // to avoid circular dependency
    .run(function ($rootScope, dffShuttleService) {
        $rootScope.$on('connectionChange', function (event, connection) {
            dffShuttleService.onConnectionChange(connection);
        });
    });
