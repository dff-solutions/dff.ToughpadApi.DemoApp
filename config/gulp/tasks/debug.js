(function () {
    "use strict";

    var gulp = require("gulp");

    /**
     * @name debug:copy
     * @description
     * Runs copydebug.
     *
     * @requires copydebug
     */
    gulp.task("debug:copy", ["copydebug"]);

    /**
     * @name debug
     * @description
     * Runs deployment for debugging.
     *
     * @requires clean
     * @requires debug:copy
     * @requires jshint
     * @requires test
     */
    gulp.task("debug", ["clean", "debug:copy", "jshint"]);
})();