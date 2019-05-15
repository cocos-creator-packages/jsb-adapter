/****************************************************************************
 LICENSING AGREEMENT
 
 Xiamen Yaji Software Co., Ltd., (the “Licensor”) grants the user (the “Licensee”) non-exclusive and non-transferable rights to use the software according to the following conditions:
 a.  The Licensee shall pay royalties to the Licensor, and the amount of those royalties and the payment method are subject to separate negotiations between the parties.
 b.  The software is licensed for use rather than sold, and the Licensor reserves all rights over the software that are not expressly granted (whether by implication, reservation or prohibition).
 c.  The open source codes contained in the software are subject to the MIT Open Source Licensing Agreement (see the attached for the details);
 d.  The Licensee acknowledges and consents to the possibility that errors may occur during the operation of the software for one or more technical reasons, and the Licensee shall take precautions and prepare remedies for such events. In such circumstance, the Licensor shall provide software patches or updates according to the agreement between the two parties. The Licensor will not assume any liability beyond the explicit wording of this Licensing Agreement.
 e.  Where the Licensor must assume liability for the software according to relevant laws, the Licensor’s entire liability is limited to the annual royalty payable by the Licensee.
 f.  The Licensor owns the portions listed in the root directory and subdirectory (if any) in the software and enjoys the intellectual property rights over those portions. As for the portions owned by the Licensor, the Licensee shall not:
 - i. Bypass or avoid any relevant technical protection measures in the products or services;
 - ii. Release the source codes to any other parties;
 - iii. Disassemble, decompile, decipher, attack, emulate, exploit or reverse-engineer these portion of code;
 - iv. Apply it to any third-party products or services without Licensor’s permission;
 - v. Publish, copy, rent, lease, sell, export, import, distribute or lend any products containing these portions of code;
 - vi. Allow others to use any services relevant to the technology of these codes;
 - vii. Conduct any other act beyond the scope of this Licensing Agreement.
 g.  This Licensing Agreement terminates immediately if the Licensee breaches this Agreement. The Licensor may claim compensation from the Licensee where the Licensee’s breach causes any damage to the Licensor.
 h.  The laws of the People's Republic of China apply to this Licensing Agreement.
 i.  This Agreement is made in both Chinese and English, and the Chinese version shall prevail the event of conflict.
 ****************************************************************************/

const Helper = cc.Graphics.Helper;
const PointFlags = cc.Graphics.Types.PointFlags;
const Point = cc.Graphics.Point;

function Path () {
    this.reset();
}

cc.js.mixin(Path.prototype, {
    reset () {
        this.closed = false;
        this.nbevel = 0;
        this.complex = true;

        if (this.points) {
            this.points.length = 0;
        }
        else {
            this.points = [];
        }
    }
});

let RenderData = function RenderData () {
    this.index = 0;
    this.byteOffset = 0;
    this.indiceStart = 0;
    this.indiceOffset = 0;
    this.vertexStart = 0;
    this.vertexOffset = 0;
};

cc.Graphics.Impl = function Impl (graphics) {
    // inner properties
    this._tessTol = 0.25;
    this._distTol = 0.01;
    this._updatePathOffset = false;
    
    this._paths = null;
    this._pathLength = 0;
    this._pathOffset = 0;
    
    this._points = null;
    this._pointsOffset = 0;
    
    this._commandx = 0;
    this._commandy = 0;

    this._paths = [];
    this._points = [];

    this._renderDatas = [];
    
    this._dataOffset = 0;
}

cc.js.mixin(cc.Graphics.Impl.prototype, {
    moveTo (x, y) {
        if (this._updatePathOffset) {
            this._pathOffset = this._pathLength;
            this._updatePathOffset = false;
        }
    
        this._addPath();
        this._addPoint(x, y, PointFlags.PT_CORNER);
    
        this._commandx = x;
        this._commandy = y;
    },

    lineTo (x, y) {
        this._addPoint(x, y, PointFlags.PT_CORNER);
        
        this._commandx = x;
        this._commandy = y;
    },

    bezierCurveTo (c1x, c1y, c2x, c2y, x, y) {
        var path = this._curPath;
        var last = path.points[path.points.length - 1];
    
        if (last.x === c1x && last.y === c1y && c2x === x && c2y === y) {
            this.lineTo(x, y);
            return;
        }
    
        Helper.tesselateBezier(this, last.x, last.y, c1x, c1y, c2x, c2y, x, y, 0, PointFlags.PT_CORNER);
    
        this._commandx = x;
        this._commandy = y;
    },

    quadraticCurveTo (cx, cy, x, y) {
        var x0 = this._commandx;
        var y0 = this._commandy;
        this.bezierCurveTo(x0 + 2.0 / 3.0 * (cx - x0), y0 + 2.0 / 3.0 * (cy - y0), x + 2.0 / 3.0 * (cx - x), y + 2.0 / 3.0 * (cy - y), x, y);
    },

    arc (cx, cy, r, startAngle, endAngle, counterclockwise) {
        Helper.arc(this, cx, cy, r, startAngle, endAngle, counterclockwise);
    },

    ellipse (cx, cy, rx, ry) {
        Helper.ellipse(this, cx, cy, rx, ry);
        this._curPath.complex = false;
    },

    circle (cx, cy, r) {
        Helper.ellipse(this, cx, cy, r, r);
        this._curPath.complex = false;
    },

    rect (x, y, w, h) {
        this.moveTo(x, y);
        this.lineTo(x, y + h);
        this.lineTo(x + w, y + h);
        this.lineTo(x + w, y);
        this.close();
        this._curPath.complex = false;
    },

    roundRect (x, y, w, h, r) {
        Helper.roundRect(this, x, y, w, h, r);
        this._curPath.complex = false;
    },

    clear (comp, clean) {
        this._pathLength = 0;
        this._pathOffset = 0;
        this._pointsOffset = 0;
        
        this._dataOffset = 0;
        
        this._curPath = null;
    
        let datas = this._renderDatas;
        this._paths.length = 0;
        this._points.length = 0;
        datas.length = 0;
        comp._renderHandle.clear();
    },

    close () {
        this._curPath.closed = true;
    },

    _addPath () {
        var offset = this._pathLength;
        var path = this._paths[offset];
    
        if (!path) {
            path = new Path();
    
            this._paths.push(path);
        } else {
            path.reset();
        }
    
        this._pathLength++;
        this._curPath = path;
    
        return path;
    },
    
    _addPoint (x, y, flags) {
        var path = this._curPath;
        if (!path) return;
    
        var pt;
        var points = this._points;
        var pathPoints = path.points;
    
        var offset = this._pointsOffset++;
        pt = points[offset];
    
        if (!pt) {
            pt = new Point(x, y);
            points.push(pt);
        } else {
            pt.x = x;
            pt.y = y;
        }
    
        pt.flags = flags;
        pathPoints.push(pt);
    },

    requestRenderData (graphics, cverts) {
        let renderHandle = graphics._renderHandle;
        let vCount = (cverts && cverts > 0) ?  cverts : 256;
        let byteLength = vCount * graphics._vertexFormat._bytes;
        let iCount = vCount * 3;
        let vertices = new Float32Array(byteLength);
        let indices = new Uint16Array(iCount);
        let renderData = new RenderData();
        renderData.index = this._dataOffset;
        renderData.vertexStart = 0;
        renderData.vertexOffset = vCount;
        renderData.indiceStart = 0;
        renderData.indiceOffset = iCount;
        renderData.byteOffset = byteLength;
        this._renderDatas.push(renderData);

        renderHandle.updateMesh(this._dataOffset, vertices, indices);

        return renderData;
    },

    getRenderDatas (graphics, cverts) {
        if (this._renderDatas.length === 0) {
            this.requestRenderData(graphics, cverts);
        }

        return this._renderDatas;
    },

    reallocVData (graphics, index, vcount) {
        let renderData = this._renderDatas[index];
        let renderHandler = graphics._renderHandle;
        let vData = renderHandler.vDatas[index];
        
        let oldVData;
        if (vData) {
            oldVData = new Uint8Array(vData.buffer);
        }

        renderData.vertexOffset += vcount;
        renderData.byteOffset += vcount * graphics._vertexFormat._bytes;
        let vertices = new Float32Array(renderData.byteOffset);
        let newData = new Uint8Array(vertices.buffer);
        
        if (oldVData) {
            for (let i = 0, l = oldVData.length; i < l; i++) {
                newData[i] = oldVData[i];
            }
        }

        return vertices
    },

    reallocIData (graphics, index, icount) {
        let iBytes = icount;
        let renderHandler = graphics._renderHandle;
        let oldIData = renderHandler.iDatas[index];
        let renderData = this._renderDatas[index];
        
        renderData.indiceOffset += iBytes;

        let indices = new Uint16Array(renderData.indiceOffset);

        if (oldIData) {
            for (let i = 0, l = oldIData.length; i < l; i++) {
                indices[i] = oldIData[i];
            }
        }

        return indices;
    },
});
