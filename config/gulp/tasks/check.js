(function() {
    'use strict';

    var gulp = require('gulp'),
        sh = require('shelljs'),
        gutil = require('gulp-util');

    /**
     * @name git-check
     * @description
     * Checks if git is installed
     */
    gulp.task('git-check', function(done) {
      if (!sh.which('git')) {
        gutil.log(
          '  ' + gutil.colors.red('Git is not installed.'),
          '\n  Git, the version control system, is required to download Ionic.',
          '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
          '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        //process.exit(1);
        throw new Error("Git is not installed");
      }
      done();
    });

    /**
     * @name cordova-check
     * @description
     * Checks if cordova is installed
     */
    gulp.task("cordova-check", function (cb) {
      if (!sh.which('cordova')) {
        gutil.log(
          '  ' + gutil.colors.red('cordova is not installed.'),
          '\n  cordova, is required to setup and build this project.',
          '\n  run \'' + gutil.colors.cyan('npm install -g cordova') + '\' to install.'
        );

        //process.exit(1);
        throw new Error("cordova is not installed");
      }

      cb();
    });

    gulp.task("dep-check", ["git-check", "cordova-check"]);
}());