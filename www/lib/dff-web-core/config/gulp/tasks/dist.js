(function () {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var gulp = require("gulp"),
        pkg = require("../../../package.json"),
        paths = require("../paths"),
        // debug = require("gulp-debug"),
        concat = require('gulp-concat'),
        ngAnnotate = require('gulp-ng-annotate'),
        rename = require('gulp-rename'),
        uglify = require('gulp-uglify'),
        header = require('gulp-header'),
        footer = require('gulp-footer');

    var PREFIX_FILE = "../../component.prefix";
    var SUFFIX_FILE = "../../component.suffix";
    var HEADER_FILE = "../../header.txt";

    var banner = fs.readFileSync(path.join(__dirname, HEADER_FILE), 'utf-8');
    var componentPrefix = fs.readFileSync(path.join(__dirname, PREFIX_FILE), 'utf-8');
    var componentSuffix = fs.readFileSync(path.join(__dirname, SUFFIX_FILE), 'utf-8');

    var date = new Date();

    gulp.task("dist:angular", ["clean", "jshint"], function () {
        return gulp
            .src([paths.src + "**/*angular.js"])
            // .pipe(debug())
            .pipe(ngAnnotate({
                add: true,
                single_quotes: true
            }))
            .pipe(concat(pkg.name + ".angular.js"))
            .pipe(header(componentPrefix))
            .pipe(footer(componentSuffix))
            .pipe(header(banner, {
                pkg: pkg,
                date: date
            }))
            .pipe(gulp.dest(paths.build))
            .pipe(uglify())
            .pipe(rename( { extname: ".min.js" }))
            .pipe(gulp.dest(paths.build));
    });

    gulp.task('dist:core', ["clean", "jshint"], function () {
        return gulp
            .src([paths.src + "**/*.js", "!**/*Worker.js", "!**/*.angular.js"])
            // .pipe(debug())
            .pipe(concat(pkg.name + ".js"))
            .pipe(header(componentPrefix))
            .pipe(footer(componentSuffix))
            .pipe(header(banner, {
                pkg: pkg,
                date: date
            }))
            .pipe(gulp.dest(paths.build))
            .pipe(uglify())
            .pipe(rename( { extname: ".min.js" }))
            .pipe(gulp.dest(paths.build));
    });

    gulp.task('dist', ["dist:core", "dist:angular", "iconfont", "jsdoc"]);
})();
