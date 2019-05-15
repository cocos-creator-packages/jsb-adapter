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

const PointFlags = cc.Graphics.Types.PointFlags;
const LineJoin = cc.Graphics.LineJoin;
const LineCap = cc.Graphics.LineCap;
const Earcut = cc.Graphics.earcut;
const Impl = cc.Graphics.Impl;

const MAX_VERTEX = 65535;
const MAX_INDICE = MAX_VERTEX * 2;

const PI      = Math.PI;
const min     = Math.min;
const max     = Math.max;
const ceil    = Math.ceil;
const acos    = Math.acos;
const cos     = Math.cos;
const sin     = Math.sin;
const atan2   = Math.atan2;
const abs     = Math.abs;

let _renderData = null;
let _index = 0;
let _renderHandle = null;
let _impl = null;
let _curColor = 0;

function curveDivs (r, arc, tol) {
    let da = acos(r / (r + tol)) * 2.0;
    return max(2, ceil(arc / da));
}

function clamp (v, min, max) {
    if (v < min) {
        return min;
    }
    else if (v > max) {
        return max;
    }
    return v;
}

cc.Graphics._assembler = {
    useModel: true,
    createImpl (graphics) {
        return new Impl(graphics);
    },

    updateRenderData (graphics) {
        let datas = graphics._impl.getRenderDatas(graphics);
        graphics._activateMaterial();
        for (let i = 0, l = datas.length; i < l; i++) {
            graphics._renderHandle.updateMaterial(i, graphics.getMaterial());
        }
    },

    genRenderData (graphics, cverts) {
        let renderHandle = graphics._renderHandle;
        _impl = graphics._impl;
        let renderDatas = _impl.getRenderDatas(graphics, cverts); 
        let renderData = renderDatas[_impl._dataOffset];
        let maxVertsCount = renderData.vertexStart + cverts;
        if (maxVertsCount > MAX_VERTEX ||
            maxVertsCount * 3 > MAX_INDICE) {
            ++_impl._dataOffset;
            maxVertsCount = cverts;
            
            if (_impl._dataOffset < renderDatas.length) {
                renderData = renderDatas[_impl._dataOffset];
            }
            else {
                renderData = _impl.requestRenderData(graphics, cverts);
                renderDatas[_impl._dataOffset] = renderData;
            }
        }

        if (maxVertsCount > renderData.vertexOffset) {
            let vertices = _impl.reallocVData (graphics, _impl._dataOffset, cverts);
            let indices = _impl.reallocIData (graphics, _impl._dataOffset, cverts*3);
            renderHandle.updateMesh(_impl._dataOffset, vertices, indices);
        }

        return renderData;
    },

    stroke (graphics) {
        _curColor = graphics._strokeColor._val;
        _renderHandle = graphics._renderHandle;
        this._flattenPaths(graphics._impl);
        this._expandStroke(graphics);
        _renderHandle = null;
        graphics._impl._updatePathOffset = true;
    },

    fill (graphics) {
        _curColor = graphics._fillColor._val;
        _renderHandle = graphics._renderHandle;
        this._expandFill(graphics);
        _renderHandle = null;
        graphics._impl._updatePathOffset = true;
    },

    _expandStroke (graphics) {
        let w = graphics.lineWidth * 0.5,
            lineCap = graphics.lineCap,
            lineJoin = graphics.lineJoin,
            miterLimit = graphics.miterLimit;

        _impl = graphics._impl;
    
        let ncap = curveDivs(w, PI, _impl._tessTol);
    
        this._calculateJoins(_impl, w, lineJoin, miterLimit);
    
        let paths = _impl._paths;
        
        // Calculate max vertex usage.
        let cverts = 0;
        for (let i = _impl._pathOffset, l = _impl._pathLength; i < l; i++) {
            let path = paths[i];
            let pointsLength = path.points.length;

            if (lineJoin === LineJoin.ROUND) cverts += (pointsLength + path.nbevel * (ncap + 2) + 1) * 2; // plus one for loop
            else cverts += (pointsLength + path.nbevel * 5 + 1) * 2; // plus one for loop

            if (!path.closed) {
                // space for caps
                if (lineCap === LineCap.ROUND) {
                    cverts += (ncap * 2 + 2) * 2;
                } else {
                    cverts += (3 + 3) * 2;
                }
            }
        }
        
        let renderData = _renderData = this.genRenderData(graphics, cverts),
            renderHandle = graphics._renderHandle,
            vData = renderHandle.vDatas[renderData.index],
            iData = renderHandle.iDatas[renderData.index];
            _index = renderData.index;
            
        for (let i = _impl._pathOffset, l = _impl._pathLength; i < l; i++) {
            let path = paths[i];
            let pts = path.points;
            let pointsLength = pts.length;
            let offset = renderData.vertexStart;

            let p0, p1;
            let start, end, loop;
            loop = path.closed;
            if (loop) {
                // Looping
                p0 = pts[pointsLength - 1];
                p1 = pts[0];
                start = 0;
                end = pointsLength;
            } else {
                // Add cap
                p0 = pts[0];
                p1 = pts[1];
                start = 1;
                end = pointsLength - 1;
            }
    
            if (!loop) {
                // Add cap
                let dPos = p1.sub(p0);
                dPos.normalizeSelf();
    
                let dx = dPos.x;
                let dy = dPos.y;
    
                if (lineCap === LineCap.BUTT)
                    this._buttCap(p0, dx, dy, w, 0);
                else if (lineCap === LineCap.SQUARE)
                    this._buttCap(p0, dx, dy, w, w);
                else if (lineCap === LineCap.ROUND)
                    this._roundCapStart(p0, dx, dy, w, ncap);
            }
    
            for (let j = start; j < end; ++j) {
                if (lineJoin === LineJoin.ROUND) {
                    this._roundJoin(p0, p1, w, w, ncap);
                }
                else if ((p1.flags & (PointFlags.PT_BEVEL | PointFlags.PT_INNERBEVEL)) !== 0) {
                    this._bevelJoin(p0, p1, w, w);
                }
                else {
                    this._vset(p1.x + p1.dmx * w, p1.y + p1.dmy * w);
                    this._vset(p1.x - p1.dmx * w, p1.y - p1.dmy * w);
                }
    
                p0 = p1;
                p1 = pts[j + 1];
            }
    
            if (loop) {
                // Loop it
                let vDataoOfset = offset * 3;
                this._vset(vData[vDataoOfset],   vData[vDataoOfset+1]);
                this._vset(vData[vDataoOfset+3], vData[vDataoOfset+4]);
            } else {
                // Add cap
                let dPos = p1.sub(p0);
                dPos.normalizeSelf();
    
                let dx = dPos.x;
                let dy = dPos.y;
    
                if (lineCap === LineCap.BUTT)
                    this._buttCap(p1, dx, dy, w, 0);
                else if (lineCap === LineCap.BUTT || lineCap === LineCap.SQUARE)
                    this._buttCap(p1, dx, dy, w, w);
                else if (lineCap === LineCap.ROUND)
                    this._roundCapEnd(p1, dx, dy, w, ncap);
            }

            // stroke indices
            let indicesOffset = renderData.indiceStart;
            for (let start = offset+2, end = renderData.vertexStart; start < end; start++) {
                iData[indicesOffset++] = start - 2;
                iData[indicesOffset++] = start - 1;
                iData[indicesOffset++] = start;
            }

            renderData.indiceStart = indicesOffset;
        }
        renderHandle.updateIAData(renderData.index, 0, renderData.indiceStart);
        _renderData = null;
        _impl = null;
    },
    
    _expandFill (graphics) {

        _impl = graphics._impl;

        let paths = _impl._paths;

        // Calculate max vertex usage.
        let cverts = 0;
        for (let i = _impl._pathOffset, l = _impl._pathLength; i < l; i++) {
            let path = paths[i];
            let pointsLength = path.points.length;

            cverts += pointsLength;
        }

        let renderData = _renderData = this.genRenderData(graphics, cverts),
            renderHandle = graphics._renderHandle,
            vData = renderHandle.vDatas[renderData.index],
            iData = renderHandle.iDatas[renderData.index];
            _index = renderData.index;
        for (let i = _impl._pathOffset, l = _impl._pathLength; i < l; i++) {
            let path = paths[i];
            let pts = path.points;
            let pointsLength = pts.length;
    
            if (pointsLength === 0) {
                continue;
            }
    
            // Calculate shape vertices.
            let offset = renderData.vertexStart;
    
            for (let j = 0; j < pointsLength; ++j) {
                this._vset(pts[j].x, pts[j].y);
            }
    
            let indicesOffset = renderData.indiceStart;
    
            if (path.complex) {
                let earcutData = [];
                for (let j = offset, end = renderData.vertexStart; j < end; j++) {
                    let vDataOffset = j * 3;
                    earcutData.push(vData[vDataOffset]);
                    earcutData.push(vData[vDataOffset+1]);
                }
    
                let newIndices = Earcut(earcutData, null, 2);
    
                if (!newIndices || newIndices.length === 0) {
                    continue;
                }
    
                for (let j = 0, nIndices = newIndices.length; j < nIndices; j++) {
                    iData[indicesOffset++] = newIndices[j] + offset;
                }
            }
            else {
                let first = offset;
                for (let start = offset+2, end = renderData.vertexStart; start < end; start++) {
                    iData[indicesOffset++] = first;
                    iData[indicesOffset++] = start - 1;
                    iData[indicesOffset++] = start;
                }
            }

            renderData.indiceStart = indicesOffset;
        }

        renderHandle.updateIAData(renderData.index, 0, renderData.indiceStart);
        _renderData = null;
        _impl = null;
    },

    _calculateJoins (impl, w, lineJoin, miterLimit) {
        let iw = 0.0;
    
        if (w > 0.0) {
            iw = 1 / w;
        }
    
        // Calculate which joins needs extra vertices to append, and gather vertex count.
        let paths = impl._paths;
        for (let i = impl._pathOffset, l = impl._pathLength; i < l; i++) {
            let path = paths[i];
    
            let pts = path.points;
            let ptsLength = pts.length;
            let p0 = pts[ptsLength - 1];
            let p1 = pts[0];
            let nleft = 0;
    
            path.nbevel = 0;
    
            for (let j = 0; j < ptsLength; j++) {
                let dmr2, cross, limit;
    
                // perp normals
                let dlx0 = p0.dy;
                let dly0 = -p0.dx;
                let dlx1 = p1.dy;
                let dly1 = -p1.dx;
    
                // Calculate extrusions
                p1.dmx = (dlx0 + dlx1) * 0.5;
                p1.dmy = (dly0 + dly1) * 0.5;
                dmr2 = p1.dmx * p1.dmx + p1.dmy * p1.dmy;
                if (dmr2 > 0.000001) {
                    let scale = 1 / dmr2;
                    if (scale > 600) {
                        scale = 600;
                    }
                    p1.dmx *= scale;
                    p1.dmy *= scale;
                }
    
                // Keep track of left turns.
                cross = p1.dx * p0.dy - p0.dx * p1.dy;
                if (cross > 0) {
                    nleft++;
                    p1.flags |= PointFlags.PT_LEFT;
                }
    
                // Calculate if we should use bevel or miter for inner join.
                limit = max(11, min(p0.len, p1.len) * iw);
                if (dmr2 * limit * limit < 1) {
                    p1.flags |= PointFlags.PT_INNERBEVEL;
                }
    
                // Check to see if the corner needs to be beveled.
                if (p1.flags & PointFlags.PT_CORNER) {
                    if (dmr2 * miterLimit * miterLimit < 1 || lineJoin === LineJoin.BEVEL || lineJoin === LineJoin.ROUND) {
                        p1.flags |= PointFlags.PT_BEVEL;
                    }
                }
    
                if ((p1.flags & (PointFlags.PT_BEVEL | PointFlags.PT_INNERBEVEL)) !== 0) {
                    path.nbevel++;
                }
    
                p0 = p1;
                p1 = pts[j + 1];
            }
        }
    },
    
    _flattenPaths (impl) {
        let paths = impl._paths;
        for (let i = impl._pathOffset, l = impl._pathLength; i < l; i++) {
            let path = paths[i];
            let pts = path.points;
    
            let p0 = pts[pts.length - 1];
            let p1 = pts[0];
    
            if (p0.equals(p1)) {
                path.closed = true;
                pts.pop();
                p0 = pts[pts.length - 1];
            }
    
            for (let j = 0, size = pts.length; j < size; j++) {
                // Calculate segment direction and length
                let dPos = p1.sub(p0);
                p0.len = dPos.mag();
                if (dPos.x || dPos.y)
                    dPos.normalizeSelf();
                p0.dx = dPos.x;
                p0.dy = dPos.y;
                // Advance
                p0 = p1;
                p1 = pts[j + 1];
            }
        }
    },

    _chooseBevel (bevel, p0, p1, w) {
        let x = p1.x;
        let y = p1.y;
        let x0, y0, x1, y1;
    
        if (bevel !== 0) {
            x0 = x + p0.dy * w;
            y0 = y - p0.dx * w;
            x1 = x + p1.dy * w;
            y1 = y - p1.dx * w;
        } else {
            x0 = x1 = x + p1.dmx * w;
            y0 = y1 = y + p1.dmy * w;
        }
    
        return [x0, y0, x1, y1];
    },
    
    _buttCap (p, dx, dy, w, d) {
        let px = p.x - dx * d;
        let py = p.y - dy * d;
        let dlx = dy;
        let dly = -dx;
    
        this._vset(px + dlx * w, py + dly * w);
        this._vset(px - dlx * w, py - dly * w);
    },
    
    _roundCapStart (p, dx, dy, w, ncap) {
        let px = p.x;
        let py = p.y;
        let dlx = dy;
        let dly = -dx;
    
        for (let i = 0; i < ncap; i++) {
            let a = i / (ncap - 1) * PI;
            let ax = cos(a) * w,
                ay = sin(a) * w;
            this._vset(px - dlx * ax - dx * ay, py - dly * ax - dy * ay);
            this._vset(px, py);
        }
        this._vset(px + dlx * w, py + dly * w);
        this._vset(px - dlx * w, py - dly * w);
    },
    
    _roundCapEnd (p, dx, dy, w, ncap) {
        let px = p.x;
        let py = p.y;
        let dlx = dy;
        let dly = -dx;
    
        this._vset(px + dlx * w, py + dly * w);
        this._vset(px - dlx * w, py - dly * w);
        for (let i = 0; i < ncap; i++) {
            let a = i / (ncap - 1) * PI;
            let ax = cos(a) * w,
                ay = sin(a) * w;
            this._vset(px, py);
            this._vset(px - dlx * ax + dx * ay, py - dly * ax + dy * ay);
        }
    },
    
    _roundJoin (p0, p1, lw, rw, ncap) {
        let dlx0 = p0.dy;
        let dly0 = -p0.dx;
        let dlx1 = p1.dy;
        let dly1 = -p1.dx;
    
        let p1x = p1.x;
        let p1y = p1.y;
    
        if ((p1.flags & PointFlags.PT_LEFT) !== 0) {
            let out = this._chooseBevel(p1.flags & PointFlags.PT_INNERBEVEL, p0, p1, lw);
            let lx0 = out[0];
            let ly0 = out[1];
            let lx1 = out[2];
            let ly1 = out[3];
    
            let a0 = atan2(-dly0, -dlx0);
            let a1 = atan2(-dly1, -dlx1);
            if (a1 > a0) a1 -= PI * 2;
    
            this._vset(lx0, ly0);
            this._vset(p1x - dlx0 * rw, p1.y - dly0 * rw);
    
            let n = clamp(ceil((a0 - a1) / PI) * ncap, 2, ncap);
            for (let i = 0; i < n; i++) {
                let u = i / (n - 1);
                let a = a0 + u * (a1 - a0);
                let rx = p1x + cos(a) * rw;
                let ry = p1y + sin(a) * rw;
                this._vset(p1x, p1y);
                this._vset(rx, ry);
            }
    
            this._vset(lx1, ly1);
            this._vset(p1x - dlx1 * rw, p1y - dly1 * rw);
        } else {
            let out = this._chooseBevel(p1.flags & PointFlags.PT_INNERBEVEL, p0, p1, -rw);
            let rx0 = out[0];
            let ry0 = out[1];
            let rx1 = out[2];
            let ry1 = out[3];
    
            let a0 = atan2(dly0, dlx0);
            let a1 = atan2(dly1, dlx1);
            if (a1 < a0) a1 += PI * 2;
    
            this._vset(p1x + dlx0 * rw, p1y + dly0 * rw);
            this._vset(rx0, ry0);
    
            let n = clamp(ceil((a1 - a0) / PI) * ncap, 2, ncap);
            for (let i = 0; i < n; i++) {
                let u = i / (n - 1);
                let a = a0 + u * (a1 - a0);
                let lx = p1x + cos(a) * lw;
                let ly = p1y + sin(a) * lw;
                this._vset(lx, ly);
                this._vset(p1x, p1y);
            }
    
            this._vset(p1x + dlx1 * rw, p1y + dly1 * rw);
            this._vset(rx1, ry1);
        }
    },
    
    _bevelJoin (p0, p1, lw, rw) {
        let rx0, ry0, rx1, ry1;
        let lx0, ly0, lx1, ly1;
        let dlx0 = p0.dy;
        let dly0 = -p0.dx;
        let dlx1 = p1.dy;
        let dly1 = -p1.dx;
    
        if (p1.flags & PointFlags.PT_LEFT) {
            let out = this._chooseBevel(p1.flags & PointFlags.PT_INNERBEVEL, p0, p1, lw);
            lx0 = out[0];
            ly0 = out[1];
            lx1 = out[2];
            ly1 = out[3];
    
            this._vset(lx0, ly0);
            this._vset(p1.x - dlx0 * rw, p1.y - dly0 * rw);
    
            this._vset(lx1, ly1);
            this._vset(p1.x - dlx1 * rw, p1.y - dly1 * rw);
        } else {
            let out = this._chooseBevel(p1.flags & PointFlags.PT_INNERBEVEL, p0, p1, -rw);
            rx0 = out[0];
            ry0 = out[1];
            rx1 = out[2];
            ry1 = out[3];
    
            this._vset(p1.x + dlx0 * lw, p1.y + dly0 * lw);
            this._vset(rx0, ry0);
    
            this._vset(p1.x + dlx1 * lw, p1.y + dly1 * lw);
            this._vset(rx1, ry1);
        }
    },
    
    _vset (x, y) {
        let dataOffset = _renderData.vertexStart * 3;
        let vData = _renderHandle.vDatas[_index];
        let uintVData = _renderHandle.uintVDatas[_index];
        vData[dataOffset] = x;
        vData[dataOffset+1] = y;
        uintVData[dataOffset+2] = _curColor;

        _renderData.vertexStart ++;
    },

    updateColor () {}
};
