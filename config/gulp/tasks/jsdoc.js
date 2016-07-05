(function () {
    "use strict";

    var gulp = require("gulp"),
//        jsdoc = require("gulp-jsdoc"),
        sh = require('shelljs'),
        fs   = require('fs'),
        paths = require("../paths");

    /**
     * @name jsdoc:gulp
     * @description
     * Generates jsdoc for gulp tasks.
     *
     * @requires clean:jsdoc:gulp
     */
    gulp.task('jsdoc:gulp', ["clean:jsdoc:gulp"], function () {
        /*
        var options = {
            "tags": {
                "allowUnknownTags": true,
                "dictionaries": ["jsdoc","closure"]
            },
            "templates": {
                "cleverLinks": false,
                "monospaceLinks": true
            }
        };

        var template = {
            path: 'templates/default'
        };
        */

        fs.mkdirSync(paths.jsdoc + "gulp");
        fs.mkdirSync(paths.jsdoc + "gulp/tutorials");
        sh.exec("jsdoc -c jsdoc.gulp.conf.json");
    });

    /**
     * @name jsdoc
     * @description
     * Runs jsdoc:gulp.
     *
     * @requires jsdoc:gulp
     */
    gulp.task('jsdoc', ['jsdoc:gulp']);
})();