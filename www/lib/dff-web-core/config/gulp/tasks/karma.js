(function () {
    var gulp = require('gulp'),
        karma = require('gulp-karma');

    /**
     * @name test:karma
     * @description
     * Runs karma tests.
     */
    gulp.task('test:karma', function () {
        return gulp
            .src('idontexist') // file are taken from config file
            .pipe(karma({
                configFile: 'karma.conf.js'
            }))
            .on('error', function (e) {
                // make sure failed tests cause gulp to exit non-zero.
                throw e;
            });
    });

    /**
     * @name test:karma:dep
     * @description
     * Runs karma tests with dependency to jshint so that test are run after jshint has finished.
     */
    gulp.task('test:karma:dep', ['jshint'], function () {
        return gulp.run('test:karma');
    });
}());