/****************************************************************************
 Copyright (c) 2017-2019 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of fsUtils software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in fsUtils License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var fs = jsb.fileUtils;
let jsb_downloader = new jsb.Downloader({
    countOfMaxProcessingTasks: 32,
    timeoutInSeconds: 10,
    tempFileNameSuffix: '.tmp'
});

let downloading = new cc.AssetManager.Cache();

let tempDir = fs.getWritablePath() + '/temp';
!fs.isDirectoryExist(tempDir) && fs.createDirectory(tempDir);

jsb_downloader.setOnFileTaskSuccess(task => {
    if (!downloading.has(task.requestURL)) return;
    let { onComplete } = downloading.remove(task.requestURL);

    onComplete && onComplete(null, task.storagePath);
});

jsb_downloader.setOnTaskError((task, errorCode, errorCodeInternal, errorStr) => {
    if (!downloading.has(task.requestURL)) return;
    let { onComplete } = downloading.remove(task.requestURL);
    if (task.storagePath) {
        fsUtils.deleteFile(task.storagePath);
    }
    cc.error(errorStr, errorCode);
    onComplete(new Error(errorStr), null);
});

jsb_downloader.setOnTaskProgress((task, bytesReceived, totalBytesReceived, totalBytesExpected) => {
    if (!downloading.has(task.requestURL)) return;
    let { onProgress } = downloading.get(task.requestURL);

    onProgress && onProgress(totalBytesReceived, totalBytesExpected);
});

var fsUtils = {

    fs,

    getUserDataPath () {
        return fs.getWritablePath();
    },

    checkFsValid () {
        if (!fs) {
            console.warn('can not get the file system!');
            return false;
        }
        return true;
    },

    deleteFile (filePath, onComplete) {
        var result = fs.removeFile(filePath);
        if (result === true) {
            onComplete && onComplete(null);
        }
        else {
            onComplete && onComplete(new Error('delete file failed'));
        }
    },

    downloadFile (remoteUrl, filePath, header, onProgress, onComplete) {
        downloading.add(remoteUrl, { onProgress, onComplete });
        var storagePath = filePath;
        if (!storagePath) storagePath = tempDir + '/' + performance.now() + cc.path.extname(remoteUrl);
        jsb_downloader.createDownloadFileTask(remoteUrl, storagePath, header);
    },

    saveFile (srcPath, destPath, onComplete) {
        var err = null;
        try {
            fs.writeDataToFile(fs.getDataFromFile(srcPath), destPath);
            fs.removeFile(srcPath);
        }
        catch (e) {
            err = e;
        }
        onComplete && onComplete(err);
    },

    copyFile (srcPath, destPath, onComplete) {
        var err = null;
        try {
            fs.writeDataToFile(fs.getDataFromFile(srcPath), destPath);
        }
        catch (e) {
            err = e;
        }
        onComplete && onComplete(err);
    },

    writeFile (path, data, encoding, onComplete) {
        var err = null;
        try {
            if (encoding === 'utf-8' || encoding === 'utf8') {
                fs.writeStringToFile(data, path);
            }
            else {
                fs.writeDataToFile(filePath);
            }
        }
        catch (e) {
            err = e;
        }
        onComplete && onComplete(err);
    },

    writeFileSync (path, data, encoding) {
        try {
            if (encoding === 'utf-8' || encoding === 'utf8') {
                fs.writeStringToFile(data, path);
            }
            else {
                fs.writeDataToFile(filePath);
            }
            return null;
        }
        catch (e) {
            return e;
        }
    },

    readFile (filePath, encoding, onComplete) {
        var content = null, err = null;
        try {
            if (encoding === 'utf-8' || encoding === 'utf8') {
                content = fs.getStringFromFile(filePath);
            }
            else {
                content = fs.getDataFromFile(filePath);
            }
        }
        catch (e) {
            err = e;
        }
        
        onComplete && onComplete (err, content);
    },

    readDir (filePath, onComplete) {
        var files = null, err = null;
        try {
            files = fs.listFiles(filePath);
        }
        catch (e) {
            err = e;
        }
        onComplete && onComplete(err, files);
    },

    readText (filePath, onComplete) {
        fsUtils.readFile(filePath, 'utf8', onComplete);
    },

    readArrayBuffer (filePath, onComplete) {
        fsUtils.readFile(filePath, '', onComplete);
    },

    readJson (filePath, onComplete) {
        fsUtils.readFile(filePath, 'utf8', function (err, text) {
            var out = null;
            if (!err) {
                try {
                    out = JSON.parse(text);
                }
                catch (e) {
                    cc.warn('Read json failed: ' + e.message);
                    err = new Error(e.message);
                }
            }
            onComplete && onComplete(err, out);
        });
    },

    readJsonSync (path) {
        try {
            var str = fs.getStringFromFile(path);
            return JSON.parse(str);
        }
        catch (e) {
            cc.warn('Read json failed: ' + e.message);
            return new Error(e.message);
        }
    },

    makeDirSync (path, recursive) {
        try {
            fs.createDirectory(path);
            return null;
        }
        catch (e) {
            cc.warn('Make directory failed: ' + e.message);
            return new Error(e.message);
        }
    },

    rmdirSync (dirPath, recursive) {
        try {
            fs.removeDirectory(dirPath);
        }
        catch (e) {
            cc.warn('rm directory failed: ' + e.message);
            return new Error(e.message);
        }
    },

    exists (filePath, onComplete) {
        var result = fs.isFileExist(filePath);
        onComplete && onComplete(result);
    },

    loadSubpackage (name, onProgress, onComplete) {
        throw new Error('not implement');
    }
};

window.fsUtils = module.exports = fsUtils;