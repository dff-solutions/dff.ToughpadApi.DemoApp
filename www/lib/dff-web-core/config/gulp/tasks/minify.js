(function () {
    "use strict";
/*
    var gulp = require("gulp"),
        path = require('path'),
        usemin = require("gulp-usemin"),
        uglify = require('gulp-uglify'),
        minifyHtml = require('gulp-minify-html'),
        minifyCss = require('gulp-minify-css'),
        ngAnnotate = require('gulp-ng-annotate'),
        paths = require("../paths");

    /**
     * @name minify
     * @description
     * Runs minification for main index.html document in development folder.
     * Output is written to deployment folder.
     *
     * @requires clean, setup:customize:jslibs
     */
/*
    gulp.task('minify', ["clean", "setup:customize:jslibs"], function () {
        return gulp.src(paths.src + "index.html")
            .pipe(usemin({
                html: [minifyHtml({
                    empty: true,
                    quotes: true
                })],
                libcss: [minifyCss()],
                appcss: [minifyCss({
                    // don't know what I do. But it works!
                    target: path.join("."),
                    relativeTo: path.join(".", "www", "img")
                })],
                libjs: [ngAnnotate(), uglify()],
                appjs: [ngAnnotate(), uglify()],
                appservicesjs: [ngAnnotate(), uglify()],
                appcommonjs: [ngAnnotate(), uglify()],
                appclassesjs: [ngAnnotate(), uglify()],
                appdirectivesjs: [ngAnnotate(), uglify()],
                appincludesjs: [ngAnnotate(), uglify()],
                appfeaturesjs: [ngAnnotate(), uglify()],
                MessageBoxSentShuttlesWorker: [uglify()]
            }))
            .pipe(gulp.dest(paths.www));
    });
*/
})();