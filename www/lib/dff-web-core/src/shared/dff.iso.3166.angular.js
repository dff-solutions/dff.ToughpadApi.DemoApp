    angular
        .module('dff.iso.3166', [])
        .factory('dffIso3166CodeService', function () {
              return new dff.iso[3166].CodeService();
        });
