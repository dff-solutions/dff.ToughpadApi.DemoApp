    angular
        .module('dff.settings', ['dff.idb.store'])
        .value('dffDefaultSettings', {})
        .factory('dffSettingsService', function (dffSettingsStore, dffDefaultSettings) {
            return new dff.settings.SettingsService(dffSettingsStore, dffDefaultSettings);
        });