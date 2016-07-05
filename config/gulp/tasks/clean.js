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
    gulp.task("clean:deploy", function (done) {
        del([paths.www + "/**/*"], done);
    });

    /**
     * @name clean:ngdocs
     * @description
     * Removes all folders and files in ngdocs folder.
     */
    gulp.task("clean:ngdocs", function (done) {
        del([paths.ngdocs + "/**/*"], done);
    });

    /**
     * @name clean:jsdoc:gulp
     * @description
     * Removes all folders and files in jsdoc gulp folder.
     */
    gulp.task("clean:jsdoc:gulp", function (done) {
        del([paths.jsdocgulp + "/**/*"], done);
    });

    /**
     * @name clean:release
     * @description
     * Removes all folders and files in release folder.
     */
    gulp.task("clean:release", function (done) {
        del([paths.release + "/**/*"], done);
    });

    /**
     * @name clean
     * @description
     * Removes all folders and files in release folder.
     */
    gulp.task("clean", ["clean:deploy", "clean:ngdocs", "clean:jsdoc:gulp", "clean:release"]);
})();
