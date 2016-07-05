(function () {
    "use strict";

    var gulp = require("gulp"),
        paths = require("../paths"),
        jscs = require("gulp-jscs");

    /**
     * @name jscs:src
     * @description
     * Runs javascript code style checked for development scripts.
     *
     */
    gulp.task('jscs:src', function () {
        return gulp
            .src([paths.src + "**/*.js", '!' + paths.bower + '{,/**}'])
            .pipe(jscs());
    });

    /**
     * @name jscs:gulp
     * @description
     * Runs javascript code style checked for gulp scripts.
     *
     */
    gulp.task('jscs:gulp', function () {
        return gulp
            .src([paths.config + "**/*.js"])
            .pipe(jscs());
    });

    /**
     * @name jscs:test
     * @description
     * Runs javascript code style checked for test scripts.
     *
     */
    gulp.task('jscs:test', function () {
        return gulp
            .src([paths.test + "**/*.js"])
            .pipe(jscs());
    });

    /**
     * @name jscs
     * @description
     * Runs jscs:src, jscs:gulp and jscs:test.
     *
     * @require jscs:src
     * @require jscs:gulp
     * @require jscs:test
     */
    gulp.task('jscs', ['jscs:src', 'jscs:gulp', 'jscs:test']);
})();