    angular
        .module('dff.datetime', [])
        .provider('dffDateTimeService', function () {
            var defaultFormat = 'yyyy-MM-dd HH:mm:ss';

            this.setDefaultFormat = function (format) {
                defaultFormat = format;
            };

            this.$get = function (dateFilter) {
                dff.datetime.DateTimeService.prototype.getFormatedDate = function (format) {
                    if (format) {
                        return dateFilter(this.getDate(), format);
                    }
                    else {
                        return dateFilter(this.getDate(), defaultFormat);
                    }
                };

                return new dff.datetime.DateTimeService();
            };
        });
