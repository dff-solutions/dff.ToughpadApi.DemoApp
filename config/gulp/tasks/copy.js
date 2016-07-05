(function () {
    "use strict";

    var gulp = require("gulp"),
        paths = require("../paths"),
        rename = require('gulp-rename'),
        pkg = require("../../../package.json");

    /**
     * @name copyimg
     * @description
     * Copies all imgages from development folder to deployment folder.
     *
     * @requires clean
     */
    gulp.task("copyimg", ["clean"], function () {
        return gulp
            .src(paths.img + "**/*")
            .pipe(gulp.dest(paths.www + "img"));
    });

    /**
     * @name copysounds
     * @description
     * Copies all sounds from development folder to deployment folder.
     *
     * @requires clean
     */
    gulp.task("copysounds", ["clean"], function () {
        return gulp
            .src(paths.sounds + "**/*")
            .pipe(gulp.dest(paths.www + "sounds"));
    });

    /**
     * @name copylang
     * @description
     * Copies all language files from development folder to deployment folder.
     *
     * @requires clean
     */
    gulp.task("copylang", ["clean"], function () {
        return gulp
            .src(paths.language + "**/*")
            .pipe(gulp.dest(paths.www + "language"));
    });

    /**
     * @name copydemo
     * @description
     * Copies all demo files from development folder to deployment folder.
     *
     * @requires clean
     */
    gulp.task("copydemo", ["clean"], function () {
        return gulp
            .src(paths.demo + "**/*")
            .pipe(gulp.dest(paths.www + "demo"));
    });

    /**
     * @name copydocuments
     * @description
     * Copies all htmldocuments from development folder to deployment folder.
     *
     * @requires clean
     */
    gulp.task("copydocuments", ["clean"], function () {
        return gulp
            .src([
                paths.src + '/**/*.html',
                "!**/index.html",
                '!' + paths.bower + '{,/**}'
            ])
            .pipe(gulp.dest(paths.www));
    });

    /**
     * @name copy:fonts
     * @description
     * Copies all htmldocuments from development folder to deployment folder.
     *
     * @requires clean
     */
    gulp.task("copy:fonts", ["clean"], function () {
        return gulp
            .src([paths.bower + 'ionic/release/fonts/**/*'])
            .pipe(gulp.dest(paths.www + "fonts/"));
    });

    /**
     * @name copydebug
     * @description
     * Copies all files from development folder to deployment folder.
     *
     * @requires clean
     */
    gulp.task("copydebug", ["clean", "setup:customize:jslibs"], function () {
        return gulp
            .src([paths.src + '/**/*'])
            .pipe(gulp.dest(paths.www));
    });

    /**
     * @name copy:androidapk
     * @description
     * Copies the android apk from platforms/android/ant-build to release.
     *
     * @requires clean
     */
    gulp.task("copy:androidapk", ["clean:release"], function () {
        return gulp
            .src(paths.platforms + '**/*-debug.apk', {base: paths.platforms + 'android/ant-build'})
            .pipe(rename(pkg.name + "_" + pkg.version + '.apk'))
            .pipe(gulp.dest(paths.release));
    });
})();
