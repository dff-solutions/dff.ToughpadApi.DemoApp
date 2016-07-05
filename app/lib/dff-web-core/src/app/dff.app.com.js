
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
