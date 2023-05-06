'use strict';
const { build } = require('./harness/index');
const ByteBuffer = require('byte');
function Decoder(buffer) {
    this.byteBuffer = buffer ? ByteBuffer.wrap(buffer) : null;
    this.rustState = null;
}

Decoder.prototype.read = function() {
    if (!this.rustState) {
        throw new Error('rustState can not be null');
    }
    const bytes = this.byteBuffer._bytes;
    const offset = this.byteBuffer._offset;
    const { read } = this.rustState.preset(bytes, offset);
    return read();
};

Decoder.prototype.readObject = function() {
    if (!this.rustState) {
        throw new Error('rustState can not be null');
    }
    const bytes = this.byteBuffer._bytes;
    const offset = this.byteBuffer._offset;
    const { readObject } = this.rustState.preset(bytes, offset);
    return readObject();
};

Decoder.makeState = (config) => {
    return build(config);
};

module.exports = Decoder;