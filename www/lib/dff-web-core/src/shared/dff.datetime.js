    /**
     * Datetime namespace provides functionality for date time operations.
     * A new date should always be retrieved using this service because
     * that way a dates can easily be mocked during testing.
     *
     * @namespace dff/datetime
     */
    dff.namespace('dff.datetime');


    /**
     * Provides date time operations.
     *
     * @name  DateTimeService
     * @memberOf dff/datetime
     * @constructor
     */
    dff.define('dff.datetime.DateTimeService', function () {});

    /**
     * Get new date.
     *
     * @name getDate
     * @memberOf dff/datetime.DateTimeService
     * @function
     * @instance
     *
     * @return {Date} New date with current datetime.
     */
    dff.datetime.DateTimeService.prototype.getDate = function () {
        return new Date();
    };
