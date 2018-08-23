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

function empty (item, callback) {
    return null;
}

function downloadScript (item, callback) {
    require(item.url);
    return null;
}

function downloadAudio (item, callback) {
    var loadByDeserializedAsset = item._owner instanceof cc.AudioClip;
    if (loadByDeserializedAsset) {
        return item.url;
    }
    else {
        var audioClip = new cc.AudioClip();
        // obtain user url through nativeUrl
        audioClip._setRawAsset(item.rawUrl, false);
        // obtain download url through _nativeAsset
        audioClip._nativeAsset = item.url;
        return audioClip;
    }
}

function downloadImage(item, callback) {
    let img = new Image();
    img.src = item.url;
    img.onload = function(info) {
        callback(null, img);
    }
    // Don't return anything to use async loading.
}

let downloadBinary, downloadText;
if (CC_RUNTIME) {
    downloadText = function (item) {
        var url = item.url;
    
        var result = loadRuntime().getFileSystemManager().readFileSync(url, "utf8");
        if (typeof result === 'string' && result) {
            return result;
        }
        else {
            return new Error('Download text failed: ' + url);
        }
    };
    
    downloadBinary = function (item) {
        var url = item.url;
    
        var result = loadRuntime().getFileSystemManager().readFileSync(url);
        if (result) {
            return result;
        }
        else {
            return new Error('Download binary file failed: ' + url);
        }
    };
}
else {
    downloadText = function (item) {
        var url = item.url;

        var result = FileUtils.getStringFromFile(url);
        if (typeof result === 'string' && result) {
            return result;
        }
        else {
            return new Error('Download text failed: ' + url);
        }
    };

    downloadBinary = function (item) {
        var url = item.url;

        var result = FileUtils.getDataFromFile(url);
        if (result) {
            return result;
        }
        else {
            return new Error('Download binary file failed: ' + url);
        }
    };
}

cc.loader.addDownloadHandlers({
    // JS
    'js' : downloadScript,
    'jsc' : downloadScript,

    // Images
    'png' : downloadImage,
    'jpg' : downloadImage,
    'bmp' : downloadImage,
    'jpeg' : downloadImage,
    'gif' : downloadImage,
    'ico' : downloadImage,
    'tiff' : downloadImage,
    'webp' : downloadImage,
    'image' : downloadImage,
    'pvr' : downloadImage,
    'etc' : downloadImage,

    // Audio
    'mp3' : downloadAudio,
    'ogg' : downloadAudio,
    'wav' : downloadAudio,
    'mp4' : downloadAudio,
    'm4a' : downloadAudio,

    // Text
    'txt' : downloadText,
    'xml' : downloadText,
    'vsh' : downloadText,
    'fsh' : downloadText,
    'atlas' : downloadText,

    'tmx' : downloadText,
    'tsx' : downloadText,

    'json' : downloadText,
    'ExportJson' : downloadText,
    'plist' : downloadText,

    'fnt' : downloadText,

    // Font
    'font' : empty,
    'eot' : empty,
    'ttf' : empty,
    'woff' : empty,
    'svg' : empty,
    'ttc' : empty,

    'binary' : downloadBinary,

    'default' : downloadText
});