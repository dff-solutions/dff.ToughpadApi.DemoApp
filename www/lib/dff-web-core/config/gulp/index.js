(function () {
    'use strict';

    var fs   = require('fs'),
        path   = require('path'),
        notify = require('gulp-notify');

    // don't need duplicated error messages
    notify.logLevel(0);

    fs.readdirSync('./config/gulp/tasks/')
        .filter(function (name) {
            return /(\.(js)$)/i.test(path.extname(name));
        })
        .forEach(function (task) {
            require(path.resolve('./config/gulp/tasks/', task));
        });
})();