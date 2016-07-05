(function () {
    "use strict";

    var gulp = require("gulp"),
        paths = require("../paths"),
        jshint = require("gulp-jshint");

    /**
     * @name jshint:src
     * @description
     * Runs javascript linter for development scripts.
     *
     */
    gulp.task("jshint:src", function () {
        return gulp
            .src([
                paths.src + "**/*.js",
                '!' + paths.bower + '{,/**}',
                '!' + paths.src + "**/angular-touch*.js"
            ])
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'));
    });

    /**
     * @name jshint:gulp
     * @description
     * Runs javascript linter for gulp scripts.
     *
     */
    gulp.task("jshint:gulp", function () {
        return gulp
            .src([paths.config + "**/*.js"])
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'));
    });

    /**
     * @name jshint:test
     * @description
     * Runs javascript linter for test scripts.
     *
     */
    gulp.task("jshint:test", function () {
        return gulp
            .src([paths.test + "**/*.js"])
            .pipe(jshint())
            .pipe(jshint.reporter('jshint-stylish'));
    });

    /**
     * @name jshint
     * @description
     * Runs jshint:src, jshint:gulp and jshint:test.
     *
     * @require jshint:src
     * @require jshint:gulp
     * @require jshint:test
     */
    gulp.task("jshint", ["jshint:src", "jshint:gulp", "jshint:test"]);
})();