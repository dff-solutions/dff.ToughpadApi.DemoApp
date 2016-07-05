(function () {
    var gulp = require('gulp');

    /**
     * @name test
     * @description
     * Runs test:karma:dep.
     *
     * @requires test:karma:dep
     */
    gulp.task('test', ['test:karma:dep']);
}());