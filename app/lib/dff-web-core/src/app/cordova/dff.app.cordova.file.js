    dff.namespace('dff.app.cordova.file');

    dff.define('dff.app.cordova.file.FileError', function (fileError, msg, desc) {
        this.fileError = fileError;
        this.msg = msg;
        this.desc = desc;
    });

    /**
     * @name dff.app.cordova.file.FileService
     */
    dff.define('dff.app.cordova.file.FileService', function () {});

    dff.app.cordova.file.FileService.getFileErrorDesc = function (fileError) {
        var errDesc = "";

        switch (fileError.code) {
            case FileError.NOT_FOUND_ERR:
                errDesc = "NOT_FOUND_ERR";
                break;
            case FileError.SECURITY_ERR:
                errDesc = "SECURITY_ERR";
                break;
            case FileError.ABORT_ERR:
                errDesc = "ABORT_ERR";
                break;
            case FileError.NOT_READABLE_ERR:
                errDesc = "NOT_READABLE_ERR";
                break;
            case FileError.ENCODING_ERR:
                errDesc = "ENCODING_ERR";
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
                errDesc = "NO_MODIFICATION_ALLOWED_ERR";
                break;
            case FileError.INVALID_STATE_ERR:
                errDesc = "INVALID_STATE_ERR";
                break;
            case FileError.SYNTAX_ERR:
                errDesc = "SYNTAX_ERR";
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                errDesc = "INVALID_MODIFICATION_ERR";
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                errDesc = "QUOTA_EXCEEDED_ERR";
                break;
            case FileError.TYPE_MISMATCH_ERR:
                errDesc = "TYPE_MISMATCH_ERR";
                break;
            case FileError.PATH_EXISTS_ERR:
                errDesc = "PATH_EXISTS_ERR";
                break;
        }

        return errDesc;
    };

    dff.app.cordova.file.FileService.resolveLocalFileSystemURL = function (window, url) {
        return new Promise(function (resolve, reject) {
            window.resolveLocalFileSystemURL(
                url,
                function (dirEntry) {
                    resolve(dirEntry);
                },
                function (reason) {
                    reject(new dff.app.cordova.file.FileError(
                        reason,
                        "error resolve filesystem " + url,
                        dff.app.cordova.file.FileService
                            .getFileErrorDesc(reason)
                    ));
                });
        });
    };

    dff.app.cordova.file.FileService.getDirectory = function (dir, parent, create, exclusive) {
        var paths = dir.split(/\/|\\/);

        return paths.reduce(function (prev, cur) {
            if (cur) {
                return prev
                    .then(function (par) {
                        return new Promise(function (resolve, reject) {
                            par.getDirectory(cur, { create: create, exclusive: exclusive},
                                function (dirEntry) {
                                    resolve(dirEntry);
                                }, function (reason) {
                                    reject(new dff.app.cordova.file.FileError(
                                        reason,
                                        "error getting directory " + dir,
                                        dff.app.cordova.file.FileService
                                            .getFileErrorDesc(reason)
                                    ));
                                });
                        });
                    });
            }
            else {
                return prev;
            }
        }, Promise.resolve(parent));
    };