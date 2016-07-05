(function () {
    'use strict';

    var gulp = require("gulp"),
        gutil = require("gulp-util"),
        sh = require('shelljs'),
        runSequence = require('run-sequence');

    /**
     * @name ionic:run
     * @description
     * Runs deployment for release and starts ionic run.
     *
     * @requires release
     */
    gulp.task("ionic:run", ["release"], function (cb) {
        sh.exec("ionic run --device", {}, function () {
            gutil.beep();
            cb();
        });
    });

    /**
     * @name ionic:debug
     * @description
     * Runs deployment for debug and starts ionic run.
     *
     * @requires debug
     */
    gulp.task("ionic:debug", ["debug"], function (cb) {
        sh.exec("ionic run --device", {}, function () {
            gutil.beep();
            cb();
        });
    });

    /**
     * @name ionic:release
     * @description
     * Runs the deployment and calls the copy:androidapk.
     *
     * @requires debug
     */
    gulp.task("ionic:release", ["ionic:run"], function (done) {
        runSequence('copy:androidapk', done);
    });
}());