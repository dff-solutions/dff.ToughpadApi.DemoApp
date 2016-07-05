(function () {
    "use strict";

    var gulp = require('gulp'),
        sh = require('shelljs'),
        gutil = require('gulp-util'),
        bower = require('bower'),
        jeditor = require("gulp-json-editor"),
        replace = require('gulp-replace'),
        paths = require("../paths"),
        cordovaPkg = require('../../../cordova.json');

    /**
     * @name setup:clean
     * @description
     * Removes all cordova platforms and plugins.
     * Removes plugins also from the list in package.json.
     */
    gulp.task("setup:clean", function (cb) {
        sh.rm("-rf", paths.platforms);
        sh.rm("-rf", paths.plugins);

        // clear plugin list that plugins are not installed twice
        gulp
            .src('package.json')
            .pipe(jeditor(function (json) {
                json.cordovaPlugins = [];
                json.cordovaPlatforms = [];

                return json;
            }))
            .pipe(gulp.dest("."));

        sh.exec("mkdir www");
        cb();
    });

    /**
     * @name setup:platforms
     * @description
     * Installs all cordova platforms definde in cordova.json.
     *
     * @requires setup:clean
     * @requires dep-check
     */
    gulp.task("setup:platforms", ["setup:clean", "dep-check"], function (cb) {
        var rc;

        cordovaPkg.platforms.forEach(function (platform) {
            var command = "add";
            var platformCmd = 'cordova platform ' + command + ' ' + platform;
            rc = sh.exec(platformCmd);
        });

        cb();
    });

    /**
     * @name setup:plugins
     * @description
     * Installs all cordova plugins definde in cordova.json.
     *
     * @requires setup:clean
     * @requires setup:platforms
     * @requires dep-check
     */
    gulp.task("setup:plugins", ["setup:clean", "setup:platforms", "dep-check"], function (cb) {
        var command = "add";
        var rc;

        cordovaPkg.plugins.forEach(function (plugin) {
            
            var pluginCmd = 'cordova plugin ' + command + ' ';

            if (typeof plugin === 'string') {
                pluginCmd += plugin;
            }
            else {
                if (command === 'add') {
                    pluginCmd += plugin.locator + ' ';

                    if (plugin.variables) {
                        var variables = Object.keys(plugin.variables);
                        variables.forEach(function (variable) {
                            pluginCmd += '--variable ' + variable +
                                '="' + plugin.variables[variable] + '" ';
                        });
                    }
                }
                else {
                    pluginCmd += plugin.id;
                }
            }
            
            rc = sh.exec(pluginCmd).code;

            if (rc !== 0) {
                gutil.log("Error code: " + rc);
            }
        });

        cb();
    });

    /**
     * @name install
     * @description
     * Installs all bower components.
     *
     * @requires git-check
     */
    gulp.task('bower:install', ['git-check'], function() {
      return bower.commands.install()
        .on('log', function(data) {
          gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
    });

    /**
     * @name setup:externallibs
     * @description
     * Copies external libraries to the platform specific lib folder.
     *
     * @requires setup:clean
     * @requires setup:platforms
     */
    gulp.task("setup:externallibs", ["setup:platforms", "setup:plugins"], function () {
        cordovaPkg.platforms.forEach(function (platform) {
            gulp
                .src(paths.externallibs + platform + "/**/*")
                .pipe(gulp.dest(paths.platforms + platform + "/libs"));
        });
    });

    /**
     * @name setup:customize:jslibs
     * @description
     * Modifies external javascript libraries.
     */
    gulp.task("setup:customize:jslibs", [], function () {
        var touchTolerance = 50;

        return gulp
            .src(paths.bower + "/**/ionic.js")
            .pipe(replace(/(var TAP_RELEASE_TOLERANCE = )[0-9]+(;)/g, "$1" + touchTolerance + "$2"))
            .pipe(gulp.dest(function (file) {
                return file.base; // overwrite src
            }));
    });

    /**
     * @name setup
     * @description
     * Run setup:platforms, setup:plugins, setup:externallibs
     *
     * @requires setup:platforms
     * @requires setup:plugins
     * @requires setup:externallibs
     */
    gulp.task("setup", ["setup:platforms", "setup:plugins", "setup:externallibs"]);
})();