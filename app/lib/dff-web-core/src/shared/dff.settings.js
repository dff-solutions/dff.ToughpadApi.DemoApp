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
