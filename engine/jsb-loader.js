/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

 'use strict';

const cacheManager = require('./jsb-cache-manager');
const { downloadFile, readText, readArrayBuffer, readJson } = require('./jsb-fs-utils');

const REGEX = /^\w+:\/\/.*/;
const downloader = cc.assetManager.downloader;
const parser = cc.assetManager.parser;
const suffix = 0;

function downloadScript (url, options, onComplete) {
    if (typeof options === 'function') {
        onComplete = options;
        options = null;
    }
    if (REGEX.test(url)) {
        onComplete && onComplete(new Error('Native does not support loading remote scripts'));
    }
    else {
        window.require(url);
        onComplete && onComplete(null);
    }
}


function download (url, func, options, onProgress, onComplete) {
    var result = transformUrl(url, options);
    if (result.inLocal) {
        func(result.url, options, onComplete);
    }
    else if (result.inCache) {
        cacheManager.updateLastTime(url)
        func(result.url, options, onComplete);
    }
    else {
        var time = Date.now();
        var storagePath = cacheManager.cacheDir + '/' + time + (suffix++) + cc.path.extname(url);
        downloadFile(url, storagePath, options.header, onProgress, function (err, path) {
            if (err) {
                onComplete(err, null);
                return;
            }
            func(path, options, function (err, data) {
                if (!err) {
                    cacheManager.cacheFile(url, storagePath);
                }
                onComplete(err, data);
            });
        });
    }
}

function transformUrl (url, options) {
    var inLocal = false;
    var inCache = false;
    if (REGEX.test(url)) {
        if (options.reload) {
            return { url };
        }
        else {
            var cache = cacheManager.cachedFiles.get(url);
            if (cache) {
                inCache = true;
                url = cache.url;
            }
        }
    }
    else {
        inLocal = true;
    }
    return { url, inLocal, inCache };
}

function downloadAudio (url, options, onComplete) {
    download(url, function (url, options, onComplete) {
        onComplete(null, url);
    }, options, options.onProgress, onComplete);
}

function downloadImage (url, options, onComplete) {
    download(url, downloader.downloadDomImage, options, options.onProgress, onComplete);
}

function downloadFont (url, options, onComplete) {
    download(url, loadFont, options, options.onProgress, onComplete);
}

function _getFontFamily (fontHandle) {
    var ttfIndex = fontHandle.lastIndexOf(".ttf");
    if (ttfIndex === -1) return fontHandle;

    var slashPos = fontHandle.lastIndexOf("/");
    var fontFamilyName;
    if (slashPos === -1) {
        fontFamilyName = fontHandle.substring(0, ttfIndex) + "_LABEL";
    } else {
        fontFamilyName = fontHandle.substring(slashPos + 1, ttfIndex) + "_LABEL";
    }
    if (fontFamilyName.indexOf(' ') !== -1) {
        fontFamilyName = '"' + fontFamilyName + '"';
    }
    return fontFamilyName;
}

function readFile(filePath, options, onComplete) {
    switch (options.responseType) {
        case 'json': 
            readJson(filePath, onComplete);
            break;
        case 'arraybuffer':
            readArrayBuffer(filePath, onComplete);
            break;
        default:
            readText(filePath, onComplete);
            break;
    }
}

function downloadText (url, options, onComplete) {
    options.responseType = "text";
    download(url, readFile, options, options.onProgress, onComplete);
}

function downloadArrayBuffer (url, options, onComplete) {
    options.responseType = "arraybuffer";
    download(url, readFile, options, options.onProgress, onComplete);
}

function downloadJson (url, options, onComplete) {
    options.responseType = "json";
    download(url, readFile, options, options.onProgress, onComplete);
} 

function loadFont (url, options, onComplete) {
    let fontFamilyName = _getFontFamily(url);

    let fontFace = new FontFace(fontFamilyName, "url('" + url + "')");
    document.fonts.add(fontFace);

    fontFace.load();
    fontFace.loaded.then(function() {
        onComplete(null, fontFamilyName);
    }, function () {
        cc.warnID(4933, fontFamilyName);
        onComplete(null, fontFamilyName);
    });
}

function parsePVRTex (file, options, onComplete) {
    onComplete && onComplete(null, file);
}

function parsePKMTex (file, options, onComplete) {
    onComplete && onComplete(null, file);
}

parser.parsePVRTex = parsePVRTex;
parser.parsePKMTex = parsePKMTex;
downloader.downloadScript = downloadScript;

downloader.register({
    // JS
    '.js' : downloadScript,
    '.jsc' : downloadScript,

    // Audio
    '.mp3' : downloadAudio,
    '.ogg' : downloadAudio,
    '.wav' : downloadAudio,
    '.mp4' : downloadAudio,
    '.m4a' : downloadAudio,

    // Images
    '.png' : downloadImage,
    '.jpg' : downloadImage,
    '.bmp' : downloadImage,
    '.jpeg' : downloadImage,
    '.gif' : downloadImage,
    '.ico' : downloadImage,
    '.tiff' : downloadImage,
    '.webp' : downloadImage,
    '.image' : downloadImage,
    '.pvr' : downloadImage,
    '.pkm' : downloadImage,

    // Text
    '.txt' : downloadText,
    '.xml' : downloadText,
    '.vsh' : downloadText,
    '.fsh' : downloadText,
    '.atlas' : downloadText,

    '.tmx' : downloadText,
    '.tsx' : downloadText,

    '.json' : downloadJson,
    '.ExportJson' : downloadJson,
    '.plist' : downloadText,

    '.fnt' : downloadText,

    '.binary' : downloadArrayBuffer,
    '.bin' : downloadArrayBuffer,
    '.dbbin': downloadArrayBuffer,
    '.skel': downloadArrayBuffer,

    // Font
    '.font' : downloadFont,
    '.eot' : downloadFont,
    '.ttf' : downloadFont,
    '.woff' : downloadFont,
    '.svg' : downloadFont,
    '.ttc' : downloadFont,

    'default': downloadText
});

parser.register({
    // compressed texture
    '.pvr': parsePVRTex,
    '.pkm': parsePKMTex,
});

var originInit = cc.assetManager.init;
cc.assetManager.init = function (options) {
    originInit.call(cc.assetManager, options);
    cacheManager.init();
};