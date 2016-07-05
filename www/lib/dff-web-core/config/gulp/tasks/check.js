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

    gulp.task("dep-check", ["git-check"]);
}());