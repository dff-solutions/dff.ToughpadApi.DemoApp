(function () {
    'use strict';

    var gulp = require('gulp'),
        iconfont = require('gulp-iconfont'),
        consolidate = require('gulp-consolidate'),
        paths = require("../paths");

    var fontName = "dff-icons";
    var cssClass = "dff-icon";

    var runTimestamp = Math.round(Date.now()/1000);

    gulp.task('iconfont', ['clean'], function () {
        return gulp
            .src(paths.icons +  "**/*.svg")
            .pipe(iconfont({
               fontName: fontName,
               appendUnicode: false,
               formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
               timestamp: runTimestamp,
               normalize: true
            }))
            .on('glyphs', function (glyphs) {
                return gulp
                    .src(paths.icons + "templates/dff-web-core-icons.css")
                    .pipe(consolidate('lodash', {
                        glyphs: glyphs,
                        fontName: fontName,
                        fontPath: '../fonts/',
                        className: cssClass
                    }))
                    .pipe(gulp.dest(paths.build + "css/"));
            })
            .pipe(gulp.dest(paths.build + "fonts/"));
    });
})();
