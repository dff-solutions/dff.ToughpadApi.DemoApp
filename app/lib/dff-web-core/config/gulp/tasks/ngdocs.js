(function () {
    "use strict";

    var gulp = require("gulp"),
        debug = require("gulp-debug"),
        ngdocs = require("gulp-ngdocs"),
        paths = require("../paths"),
        pkg = require("../../../package.json");

    /**
     * @name ngdocs
     * @description
     * Generates ngdocs.
     *
     * @requires clean:ngdocs
     */
    gulp.task('ngdocs', ["clean:ngdocs"], function () {
        var options = {
            //scripts: ['../app.min.js'],
            html5Mode: true,
            //startPage: '/api',
            title: pkg.name + " API"
            //image: "path/to/my/image.png",
            //imageLink: "http://my-domain.com",
            //titleLink: "/api"
        };

        return gulp
        .src([
            paths.js + "**/*.js"
        ])
        .pipe(ngdocs.process(options))
        .pipe(debug())
        .pipe(gulp.dest(paths.ngdocs));
    });
})();