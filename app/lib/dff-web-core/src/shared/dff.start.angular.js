
angular
    .module('dff.start', [])
    .provider('dffStartService', function () {
        var startservices = [];

        this.registerService = function (service, priority) {
            startservices.push({
                service: service,
                priority: isNaN(priority) ? 0 : priority
            });
            return this;
        };

        this.$get = function ($injector, dffLoggingService) {
            var self = {};

            // order by priority
            startservices.sort(function (a, b) {
                return b.priority - a.priority;
            });

            self.start = function() {
                // already ordered
                return startservices.reduce(function (prev, cur) {
                    return prev
                        .then(function () {
                            var service = $injector.get(cur.service);
                            dffLoggingService.info('dffStartService', 'starting service', cur.service, cur.priority);
                            if (service.hasOwnProperty('startService')) {
                                return service.startService();
                            }
                            else {
                                return Promise.reject('dffStartService error starting ' + cur.service + '. startService() method not defined');
                            }
                        });
                }, Promise.resolve());
            };

            return self;
        };
    });
