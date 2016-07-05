/**
 * @namespace dff/util
 */
dff.namespace('dff.util');

/**
 * @namespace dff/util/guid
 */
dff.define('dff.util.guid', {
    /**
     * Creates a S4 value
     *
     * @name S4
     * @memberOf dff/util/guid
     * @function
     *
     * @returns {String} S4 value.
     */
    S4: function () {
        return (((1 + Math.random()) * 0x10000) | 0)
            .toString(16)
            .substring(1);
    },
    /**
     * Generates a GUID.
     *
     * @name generate
     * @memberOf dff/util/guid
     * @function
     *
     * @returns {String} GUID.
     */
    generate: function () {
        var guid = (
                    this.S4() + this.S4() + "-" + this.S4() + "-4" +
                    this.S4().substr(0, 3) + "-" + this.S4() + "-" +
                    this.S4() + this.S4() + this.S4()
                ).toLowerCase();

        return guid;
    }
});