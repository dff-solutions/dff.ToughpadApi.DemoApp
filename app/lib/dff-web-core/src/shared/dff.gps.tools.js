    /**
     * @namespace dff/gps/tools
     */
    dff.namespace('dff.gps.tools');

    /**
     * Provides Tools for GPS/coordinates.
     *
     * @name ToolsService
     * @memberOf dff/gps/tools
     * @constructor
     *
     * @param {Number} earthRadius Radius of earth in meters to use for calculations.
     * Default is 6378136.
     */
    dff.define('dff.gps.tools.ToolsService', function (earthRadius) {
        var self = {};
        var R = earthRadius || 6378136, // meters
            cf = Math.PI / 180;

        /**
         * Calculates the distance between two geographical coordinates.
         * Using haversine formula {@link http://en.wikipedia.org/wiki/Haversine_formula}
         *
         * @name getDistanceDec
         * @memberOf dff/gps/tools.ToolsService
         * @instance
         *
         * @param {Number} lon1 - Geographical longitute point 1 in degrease.
         * @param {Number} lat1 - Geographical latitute point 1 in degrease.
         * @param {Number} lon2 - Geographical longitute point 2 in degrease.
         * @param {Number} lat2 - Geographical latitute point 2 in degrease.
         *
         * @return {Number} distance - distance in meters.
         */
        self.getDistanceDec = function (lon1, lat1, lon2, lat2) {
            // convert deg to rad
            lat1 *= cf;
            lon1 *= cf;
            lat2 *= cf;
            lon2 *= cf;

            var dlat = (lat2 - lat1);
            var dlon = (lon2 - lon1);

            var a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dlon / 2) * Math.sin(dlon / 2);

            var c = 2 * Math.asin(Math.sqrt(a));
            var d = R * c;

            return d;
        };

        /**
         * Converts degree minutes sec to decimal degrees
         *
         * @name dms2Dec
         * @memberOf dff/gps/tools.ToolsService
         * @instance
         *
         * @param {Number} deg - Geographical degree.
         * @param {Number} min - Geographical minute.
         * @param {Number} sec - Geographical second.
         *
         * @return {Number} dec - Decimal degrees.
         */
        self.dms2Dec = function (deg, min, sec) {
            var f = 1;

            if (deg < 0) {
                f = -1;
            }

            return f * (f * deg + min / 60 + sec / 36000);
        };

        /**
         * Converts decimal degree str to number.
         *
         * @name parseStringDec
         * @memberOf dff/gps/tools.ToolsService
         * @instance
         *
         * @param {Number} strDeg - Geographical degree as string.
         *
         * @return {Number} dec - Decimal degrees.
         */
        self.parseStringDec = function (strDeg) {
            var degStrExp = /^(-?)([0-9]*)[\.,]?([0-9]*)$/;

            if (typeof strDeg === "string") {
                var sign = 1;
                var strDegPre;
                var strDegSuf;
                var strDegMatches = degStrExp.exec(strDeg);

                if (strDegMatches && strDegMatches.length >= 4) {
                    if (strDegMatches[1] === "-") {
                        sign = -1;
                    }

                    if (strDegMatches[2]) {
                        strDegPre = parseInt(strDegMatches[2]);
                    }
                    else {
                        strDegPre = 0;
                    }

                    if (strDegMatches[3]) {
                        strDegSuf = parseInt(strDegMatches[3]);
                    }
                    else {
                        strDegSuf = 0;
                    }

                    strDeg = sign * (strDegPre + strDegSuf / Math.pow(10, strDegMatches[3].length));
                }
                else {
                    throw new Error("unexpected format for strDeg: " + strDeg);
                }
            }

            return strDeg;
        };

        /**
         * Takes a dffFence and returns an object with lat, lon properties.
         *
         * @name getLonLatFromDffFence
         * @memberOf dff/gps/tools.ToolsService
         * @instance
         *
         * @param {string} fence dffFence.
         *
         * @return {object} coords Object with lat, lon properties.
         */
        self.getLonLatFromDffFence = function (fence) {
            var mr = /^([0-9]+)@(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)\|(\d+)/;

            var matchs = mr.exec(fence);

            //kein dffFence
            if (!matchs) {
                return;
            }

            //zerlegen in die bestandteile
            var londeg = parseInt(matchs[2]);
            var lonmin = parseInt(matchs[3]);
            var lonsec = parseInt(matchs[4]);
            var latdeg = parseInt(matchs[5]);
            var latmin = parseInt(matchs[6]);
            var latsec = parseInt(matchs[7]);

            //zusammenfassen zu lat und lon
            var lat = self.dms2Dec(latdeg, latmin, latsec);
            var lon = self.dms2Dec(londeg, lonmin, lonsec);

            return {lat: lat, lon: lon};
        };

        return self;
    });
