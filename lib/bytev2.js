

class ByteV2 {
    _offset;
    dataview
    _bytes

    constructor(bf) {
        this._bytes = bf;
        this._offset = 0;
        this.dataview = new DataView(bf.buffer);
    }

    get(cursor) {
        if (cursor === undefined) {
            return this.dataview.getUint8(this._offset++);
        }
        return this.dataview.getUint8(cursor);
    }

    getLong() {
        const result = this.dataview.getBigInt64(this._offset);
        this._offset += 8;
        return Number(result);
    }


    getDouble() {
        const result = this.dataview.getFloat64(this._offset);
        this._offset += 8;
        return result;
    }


    getUInt16() {
        const result = this.dataview.getUint16(this._offset);
        this._offset += 2;
        return result;
    }

    position() {
        return this._offset;
    }

    skip(len) {
        this._offset += len;
    }

    getInt() {
        const result = this.dataview.getInt32(this._offset);
        this._offset += 4;
        return result;
    }

    getChar() {
        const c = this.get();
        return String.fromCharCode(c);
    }

    getRawStringByStringLength(index, length) {
        var needUpdateOffset = false;
        if (arguments.length === 1) {
            length = index;
            index = this._offset;
            needUpdateOffset = true;
        }

        var data = [];
        var bufLength = 0;
        while (length--) {
            var pos = index + bufLength;
            var ch = this.dataview.getUint8(pos);
            if (ch < 0x80) {
                data.push(ch);
                bufLength += 1;
            } else if ((ch & 0xe0) === 0xc0) {
                var ch1 = this.dataview.getUint8(++pos);
                var v = ((ch & 0x1f) << 6) + (ch1 & 0x3f);
                data.push(v);
                bufLength += 2;
            } else if ((ch & 0xf0) === 0xe0) {
                var ch1 = this.dataview.getUint8(++pos);
                var ch2 = this.dataview.getUint8(++pos);
                var v = ((ch & 0x0f) << 12) + ((ch1 & 0x3f) << 6) + (ch2 & 0x3f);
                data.push(v);
                bufLength += 3;
            } else {
                throw new Error('string is not valid UTF-8 encode');
            }
        }
        if (needUpdateOffset) this._offset += bufLength;
        return String.fromCharCode.apply(String, data);
    }


    readRawString(index, length) {
        if (arguments.length === 2) {
            // readRawString(index, length)
        } else {
            // readRawString(length);
            length = index;
            index = this._offset;
            this._offset += length;
        }
        return this._bytes.toString('utf8', index, index + length);
    }
}
ByteV2.wrap = function(bf) {
    return new ByteV2(bf);
}
module.exports = ByteV2;