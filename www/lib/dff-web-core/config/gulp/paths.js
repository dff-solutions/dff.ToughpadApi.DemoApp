(function () {
    'use strict';

    var cwd = "src/";
    var build = "dist/";
    var docs = "docs/";
    var test = "test/";
    var config = "config/";
    var icons = "icons/";

    module.exports = {
        src: cwd,
        build: build,
        js: cwd + "js/",
        icons: icons,
        language: cwd + "language/",
        test: test,
        config: config,
        configgulp: config + "gulp/",
        docs: docs,
        ngdocs: docs + "ngdocs/",
        jsdoc: docs + "jsdoc/",
        sass: ['scss/**/*.scss']
    };
})();
