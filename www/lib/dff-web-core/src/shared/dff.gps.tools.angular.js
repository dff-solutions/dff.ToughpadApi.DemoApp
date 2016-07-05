    angular
        .module('dff.gps.tools', [])
        .provider('dffGpsToolsService', function () {
            var R;

            this.setEarthRadius = function (earthRadius) {
                R = earthRadius;
            };

            this.$get = function () {
                return new dff.gps.tools.ToolsService(R);
            };
        });