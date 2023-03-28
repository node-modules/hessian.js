"use strict";

var assert = require('assert');
var hessian = require('../../index');
var Decoder = require('../../lib/v2rust/decoder');
var big = require('../../benchmark/v2rust/big');
const ByteBuffer = require('byte');

describe('object.test.js', function () {
    describe('v2.0', function () {
        it('should decoder work', function () {
            const decoder = new Decoder();
            decoder.rustState = Decoder.makeState();
            decoder.byteBuffer = ByteBuffer.wrap(big);
            var obj1 = decoder.read();
            var obj2 = hessian.decode(big, '2.0');
            assert.deepEqual(JSON.stringify(obj1), JSON.stringify(obj2));
        });
    });
});
