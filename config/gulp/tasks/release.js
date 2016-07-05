(function () {
    "use strict";

    var gulp = require("gulp");

    /**
     * @name release:copy
     * @description
     * Runs clean, copyimg, copysounds, copylang, copydemo, copy:fonts, templates.
     *
     * @requires clean
     * @requires copyimg
     * @requires copysounds
     * @requires copylang
     * @requires copydemo
     * @requires copydocuments
     * @requires templates
     */
    gulp.task("release:copy", [
        "clean",
        "copyimg",
        "copysounds",
        "copylang",
        "copydemo",
        "copy:fonts",
        //"copydocuments"
        "templates"
    ]);

    /**
     * @name release
     * @description
     * Runs clean, minify, release:copy, jshint, test
     *
     * @requires clean
     * @requires minify
     * @requires release:copy
     * @requires jshint
     * @requires jscs
     * @requires test
     * @requires ngdocs
     * @requires jsdoc
     */
    gulp.task("release", [
        "clean", 
        "minify", 
        "release:copy", 
        "jshint", 
    //    "jscs", 
        //"test",
        "ngdocs"
        //"jsdoc"
    ]);
})();