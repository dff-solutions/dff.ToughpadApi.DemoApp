// Karma configuration
// Generated on Thu Feb 12 2015 13:42:58 GMT+0100 (Mitteleuropäische Zeit)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '.',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher'
        ],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/lodash/index.js',
            'node_modules/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            /*
            'src/dff.js',
            //shared
            'src/shared/dff.datetime.js',
            'src/shared/dff.dom.js',
            'src/shared/dff.gps.tools.js',
            'src/shared/dff.idb.js',
            'src/shared/dff.idb.store.js',
            'src/shared/dff.iso.3166.js',
            'src/shared/dff.log.js',
            'src/shared/dff.settings.js',
            'src/shared/dff.storage.js',

            //app
            'src/app/dff.app.idb.store.js',
            'src/app/dff.app.log.js',
            //intranet


            //angular-shared
            'src/shared/dff.datetime.angular.js',
            'src/shared/dff.dom.angular.js',
            'src/shared/dff.gps.tools.angular.js',
            'src/shared/dff.idb.angular.js',
            'src/shared/dff.idb.store.angular.js',
            'src/shared/dff.iso.3166.angular.js',
            'src/shared/dff.log.angular.js',
            'src/shared/dff.settings.angular.js',
            'src/shared/dff.storage.angular.js',
            //angular-app
            'src/app/dff.app.idb.store.angular.js',
            'src/app/dff.app.log.angular.js',
            //angular-intranet
            */
            'dist/dff-web-core.js',
            'dist/dff-web-core.angular.js',


            'test/**/*.spec.js'
        ],

        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['dots'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
