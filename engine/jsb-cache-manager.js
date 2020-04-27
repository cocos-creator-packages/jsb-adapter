/****************************************************************************
 Copyright (c) 2019 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of cache-manager software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in cache-manager License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
const { getUserDataPath, readJsonSync, makeDirSync, writeFileSync, writeFile, readDir, deleteFile, rmdirSync } = require('./jsb-fs-utils');

var writeCacheFileList = null;
var startWrite = false;
var nextCallbacks = [];
var callbacks = [];
var cleaning = false;

var cacheManager = {

    cacheDir: 'gamecaches',

    cachedFileName: 'cacheList.json',

    deleteInterval: 500,

    writeFileInterval: 2000,

    cachedFiles: null,

    version: '1.0',

    getCache (url) {
        return this.cachedFiles.has(url) ? this.cachedFiles.get(url).url : '';
    },

    getTemp (url) {
        return '';
    },

    init () {
        this.cacheDir = getUserDataPath() + '/' + this.cacheDir;
        var cacheFilePath = this.cacheDir + '/' + this.cachedFileName;
        var result = readJsonSync(cacheFilePath);
        if (result instanceof Error || !result.version) {
            if (!(result instanceof Error)) rmdirSync(this.cacheDir, true);
            this.cachedFiles = new cc.AssetManager.Cache();
            makeDirSync(this.cacheDir, true);
            writeFileSync(cacheFilePath, JSON.stringify({ files: this.cachedFiles._map, outOfStorage: this.outOfStorage, version: this.version }), 'utf8');
        }
        else {
            this.cachedFiles = new cc.AssetManager.Cache(result.files);
            this.outOfStorage = result.outOfStorage;
        }
    },

    updateLastTime (url) {
        if (this.cachedFiles.has(url)) {
            var cache = this.cachedFiles.get(url);
            cache.lastTime = Date.now();
        }
    },

    _write () {
        writeCacheFileList = null;
        startWrite = true;
        writeFile(this.cacheDir + '/' + this.cachedFileName, JSON.stringify({ files: this.cachedFiles._map, outOfStorage: this.outOfStorage, version: this.version }), 'utf8', function () {
            startWrite = false;
            for (let i = 0, j = callbacks.length; i < j; i++) {
                callbacks[i]();
            }
            callbacks.length = 0;
            callbacks.push.apply(callbacks, nextCallbacks);
            nextCallbacks.length = 0;
        });
    },

    writeCacheFile (cb) {
        if (!writeCacheFileList) {
            writeCacheFileList = setTimeout(this._write.bind(this), this.writeFileInterval);
            if (startWrite === true) {
                cb && nextCallbacks.push(cb);
            }
            else {
                cb && callbacks.push(cb);
            }
        } else {
            cb && callbacks.push(cb);
        }
    },

    cacheFile (id, url, cacheBundleRoot) {
        this.cachedFiles.add(id, { bundle: cacheBundleRoot, url, lastTime: Date.now() });
        this.writeCacheFile();
    },

    clearCache () {
        rmdirSync(this.cacheDir, true);
        this.cachedFiles = new cc.AssetManager.Cache();
        makeDirSync(this.cacheDir, true);
        var cacheFilePath = this.cacheDir + '/' + this.cachedFileName;
        this.outOfStorage = false;
        writeFileSync(cacheFilePath, JSON.stringify({ files: this.cachedFiles._map, outOfStorage: false, version: this.version }), 'utf8');
    },

    clearLRU () {
        if (cleaning) return;
        cleaning = true;
        var caches = [];
        this.cachedFiles.forEach(function (val, key) {
            caches.push({ originUrl: key, url: val.url, lastTime: val.lastTime });
        });
        caches.sort(function (a, b) {
            return a.lastTime - b.lastTime;
        });
        caches.length = Math.floor(this.cachedFiles.count / 3);
        for (var i = 0, l = caches.length; i < l; i++) {
            this.cachedFiles.remove(caches[i].originUrl);
        }
        this.writeCacheFile(function () {
            function deferredDelete () {
                var item = caches.pop();
                deleteFile(item.url);
                if (caches.length > 0) { 
                    setTimeout(deferredDelete, self.deleteInterval); 
                }
                else {
                    cleaning = false;
                }
            }
            setTimeout(deferredDelete, self.deleteInterval);
        });

    },

    removeCache (url) {
        if (this.cachedFiles.has(url)) {
            var self = this;
            var path = this.cachedFiles.remove(url).url;
            this.writeCacheFile(function () {
                deleteFile(path, self._deleteFileCB);
            });
        }
    },

    makeBundleFolder (bundleName) {
        makeDirSync(this.cacheDir + '/' + bundleName, true);
    }
}

cc.assetManager.cacheManager = module.exports = cacheManager;