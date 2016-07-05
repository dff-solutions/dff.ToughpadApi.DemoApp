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

    gulp.task('jsdoc:src', function () {
        sh.exec('jsdoc ' + paths.src + ' -r -c ' + paths.docs + 'conf.json -d ' + paths.jsdoc, function(code, stdout, stderr) {
            console.log('Exit code:', code);
            console.log('Program output:', stdout);
            console.log('Program stderr:', stderr);
        });
    });

    /**
     * @name jsdoc
     * @description
     * Runs jsdoc:gulp.
     *
     * @requires jsdoc:gulp
     */
    gulp.task('jsdoc', ['jsdoc:src']);
})();
