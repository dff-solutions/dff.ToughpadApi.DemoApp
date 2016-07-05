
    angular
        .module('dff.log', ['dff.datetime'])
        .value('Logtype', dff.log.Logtype)
        .value('Logline', dff.log.Logline)
        .provider('dffLoggingService', function () {
            var interceptors = [];

            this.addInterceptor = function(interceptor) {
                interceptors.push(interceptor);
            };

            this.$get = function($injector, $log, dffDateTimeService) {
                var logInterceptors = [];

                interceptors.forEach(function (interceptor) {
                    if (typeof interceptor === "string") {
                        logInterceptors.push($injector.get(interceptor));
                    }
                    else {
                        logInterceptors.push(interceptor);
                    }
                });

                return new dff.log.LoggingService($log, logInterceptors, dffDateTimeService);
            };
        });