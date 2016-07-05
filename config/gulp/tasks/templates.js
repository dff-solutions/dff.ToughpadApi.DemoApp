(function () {
    var gulp = require("gulp"),
        minifyHtml = require('gulp-minify-html'),
        templateCache = require('gulp-angular-templatecache'),
        paths = require("../paths");

    /**
     * @name templates
     * @description
     * Puts all angular html templates into angular template cache.
     *
     * @requires clean
     */
    gulp.task('templates', ["clean"], function () {
        gulp.src([paths.src + '**/*.html', "!**/index.html"])
            .pipe(minifyHtml())
            .pipe(templateCache({
                module: "app",
                standalone: false,
                filename: "app-templates.js"
            }))
            .pipe(gulp.dest(paths.www + "js/"));
    });
})();