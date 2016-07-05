(function () {
    'use strict';

    var cwd = "app/";
    var builddir = "www/";
    var docs = "docs/";
    var test = "test/";
    var config = "config/";
    var release = "release/";
    var platforms = "platforms/";

    module.exports = {
        src: cwd,
        js: cwd + "js/",
        img: cwd + "img/",
        sounds: cwd + "sounds/",
        demo: cwd + "demo/",
        language: cwd + "language/",
        bower: cwd + "lib/",
        test: test,
        config: config,
        configgulp: config + "gulp/",
        www: builddir,
        platforms: platforms,
        plugins: ['plugins/'],
        ngdocs: docs + "ngdocs/",
        jsdoc: docs + "jsdoc/",
        sass: ['scss/**/*.scss'],
        externallibs: "external_libs/",
        release: release
    };
})();