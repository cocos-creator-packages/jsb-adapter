require('./jsb_opengl_constants');

var gl = __gl;

//
// Extensions
//

const WebGLCompressedTextureS3TC = {
    COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0, // A DXT1-compressed image in an RGB image format.
    COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,// A DXT1-compressed image in an RGB image format with a simple on/off alpha value.
    COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2,// A DXT3-compressed image in an RGBA image format. Compared to a 32-bit RGBA texture, it offers 4:1 compression.
    COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3 // A DXT5-compressed image in an RGBA image format. It also provides a 4:1 compression, but differs to the DXT3 compression in how the alpha compression is done.
};

const WebGLCompressedTextureETC1 = {
    COMPRESSED_RGB_ETC1_WEBGL: 0x8D64 // Compresses 24-bit RGB data with no alpha channel.
};

const WebGLCompressedTexturePVRTC = {
    COMPRESSED_RGB_PVRTC_4BPPV1_IMG: 0x8C00, //  RGB compression in 4-bit mode. One block for each 4×4 pixels.
    COMPRESSED_RGBA_PVRTC_4BPPV1_IMG: 0x8C02,//  RGBA compression in 4-bit mode. One block for each 4×4 pixels.
    COMPRESSED_RGB_PVRTC_2BPPV1_IMG: 0x8C01, //  RGB compression in 2-bit mode. One block for each 8×4 pixels.
    COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: 0x8C03 //  RGBA compression in 2-bit mode. One block for each 8×4 pixe
};

var extensionPrefixArr = ['MOZ_', 'WEBKIT_'];

var extensionMap = {
    WEBGL_compressed_texture_s3tc: WebGLCompressedTextureS3TC,
    WEBGL_compressed_texture_pvrtc: WebGLCompressedTexturePVRTC,
    WEBGL_compressed_texture_etc1: WebGLCompressedTextureETC1
};

// From the WebGL spec:
// Returns an object if, and only if, name is an ASCII case-insensitive match [HTML] for one of the names returned from getSupportedExtensions;
// otherwise, returns null. The object returned from getExtension contains any constants or functions provided by the extension.
// A returned object may have no constants or functions if the extension does not define any, but a unique object must still be returned.
// That object is used to indicate that the extension has been enabled.
// XXX: The returned object must return the functions and constants.

var supportedExtensions = gl.getSupportedExtensions();

gl.getExtension = function(extension) {
    var prefix;
    for (var i = 0, len = extensionPrefixArr.length; i < len; ++i) {
        prefix = extensionPrefixArr[i];
        if (extension.startsWith(prefix)) {
            extension = extension.substring(prefix.length);
            break;
        }
    }

    if (supportedExtensions.indexOf(extension) > -1) {
        if (extension in extensionMap) {
            return extensionMap[extension];
        }
        return {}; //REFINE: Return an empty object to indicate this platform supports the extension. But we should not return an empty object actually.
    }

    return null;
};
