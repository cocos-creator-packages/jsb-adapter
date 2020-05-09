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
const presets = cc.assetManager.presets;
downloader.maxConcurrency = 30;
downloader.maxRequestsPerFrame = 60;
presets['preload'].maxConcurrency = 15;
presets['preload'].maxRequestsPerFrame = 30;
presets['scene'].maxConcurrency = 32;
presets['scene'].maxRequestsPerFrame = 64;
presets['bundle'].maxConcurrency = 32;
presets['bundle'].maxRequestsPerFrame = 64;
let suffix = 0;

const loadedScripts = {};

function downloadScript (url, options, onComplete) {
    if (typeof options === 'function') {
        onComplete = options;
        options = null;
    }

    if (loadedScripts[url]) return onComplete();
    
    download(url, function (url, options, onComplete) {
        window.require(url);
        onComplete(null);
    }, options, options.onFileProgress, onComplete);
}

function download (url, func, options, onFileProgress, onComplete) {
    var result = transformUrl(url, options);
    if (result.inLocal) {
        func(result.url, options, onComplete);
    }
    else if (result.inCache) {
        cacheManager.updateLastTime(url)
        func(result.url, options, function (err, data) {
            if (err) {
                cacheManager.removeCache(url);
            }
            onComplete(err, data);
        });
    }
    else {
        var time = Date.now();
        var storagePath = '';
        if (options.__cacheBundleRoot__) {
            storagePath = `${cacheManager.cacheDir}/${options.__cacheBundleRoot__}/${time}${suffix++}${cc.path.extname(url)}`;
        }
        else {
            storagePath = `${cacheManager.cacheDir}/${time}${suffix++}${cc.path.extname(url)}`;
        }
        downloadFile(url, storagePath, options.header, onFileProgress, function (err, path) {
            if (err) {
                onComplete(err, null);
                return;
            }
            func(path, options, function (err, data) {
                if (!err) {
                    cacheManager.cacheFile(url, storagePath, options.__cacheBundleRoot__);
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

function downloadMedia (url, options, onComplete) {
    download(url, function (url, options, onComplete) {
        onComplete(null, url);
    }, options, options.onFileProgress, onComplete);
}

function downloadImage (url, options, onComplete) {
    download(url, downloader.downloadDomImage, options, options.onFileProgress, onComplete);
}

function downloadFont (url, options, onComplete) {
    download(url, loadFont, options, options.onFileProgress, onComplete);
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
    download(url, readFile, options, options.onFileProgress, onComplete);
}

function downloadArrayBuffer (url, options, onComplete) {
    options.responseType = "arraybuffer";
    download(url, readFile, options, options.onFileProgress, onComplete);
}

function downloadJson (url, options, onComplete) {
    options.responseType = "json";
    download(url, readFile, options, options.onFileProgress, onComplete);
} 

function downloadBundle (url, options, onComplete) {
    let bundleName = cc.path.basename(url);
    var version = options.version || cc.assetManager.downloader.bundleVers[bundleName];
    var count = 0;
    var config = version ?  `${url}/config.${version}.json` : `${url}/config.json`;
    let out = null;
    cacheManager.makeBundleFolder(bundleName);
    options.__cacheBundleRoot__ = bundleName;
    downloadJson(config, options, function (err, response) {
        if (err) {
            onComplete(err);
            return;
        }
        out = response;
        count++;
        if (count === 2) {
            onComplete(null, out);
        }
    });

    var js = version ?  `${url}/index.${version}.js` : `${url}/index.js`;
    downloadScript(js, options, function (err) {
        if (err) {
            onComplete(err);
            return;
        }
        count++;
        if (count === 2) {
            onComplete(null, out);
        }
    });
};

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

    // Audio
    '.mp3' : downloadMedia,
    '.ogg' : downloadMedia,
    '.wav' : downloadMedia,
    '.m4a' : downloadMedia,

    // Video
    '.mp4': downloadMedia,
    '.avi': downloadMedia,
    '.mov': downloadMedia,
    '.mpg': downloadMedia,
    '.mpeg': downloadMedia,
    '.rm': downloadMedia,
    '.rmvb': downloadMedia,
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

    'bundle': downloadBundle,

    'default': downloadText
});

parser.register({
    // compressed texture
    '.pvr': parsePVRTex,
    '.pkm': parsePKMTex,
});

cc.assetManager.transformPipeline.append(function (task) {
    var input = task.output = task.input;
    for (var i = 0, l = input.length; i < l; i++) {
        var item = input[i];
        if (item.config) {
            item.options.__cacheBundleRoot__ = item.config.name;
        }
    }
});

var originInit = cc.assetManager.init;
cc.assetManager.init = function (options) {
    originInit.call(cc.assetManager, options);
    cacheManager.init();
};