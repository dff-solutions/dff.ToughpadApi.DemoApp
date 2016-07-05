(function () {
    "use strict";

    var gulp = require("gulp"),
        del  = require("del"),
        paths = require("../paths");

    /**
     * @name clean
     * @description
     * Removes all folders and files in deployment folder.
     */
    gulp.task("clean:deploy", function () {
        return del([paths.build + "/**/*"]);
    });

    /**
     * @name clean:ngdocs
     * @description
     * Removes all folders and files in ngdocs folder.
     */
    gulp.task("clean:ngdocs", function () {
        return del([paths.ngdocs + "/**/*"]);
    });

    /**
     * @name clean:ngdocs
     * @description
     * Removes all folders and files in ngdocs folder.
     */
    gulp.task("clean:jsdoc", function () {
        return del([paths.jsdoc + "**/*"]);
    });

    /**
     * @name clean
     * @description
     * Removes all folders and files in release folder.
     */
    gulp.task("clean", ["clean:deploy", "clean:jsdoc"]);
})();
