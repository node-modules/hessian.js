'use strict';

const hessian = require('../');
const utils = require('./utils');
const assert = require('assert');

describe('binary.test.js', function() {
  it('should read "foo" binary', function() {
    hessian.decode(Buffer.concat([ Buffer.from([ 'B'.charCodeAt(0), 0x00, 0x03 ]), Buffer.from('foo') ]));
  });

  it('should write "foo"', function() {
    assert.deepEqual(
      hessian.encode(Buffer.from('foo')),
      Buffer.concat([ Buffer.from([ 'B'.charCodeAt(0), 0x00, 0x03 ]), Buffer.from('foo') ])
    );
  });

  it('should read and write empty binary', function() {
    const empty = hessian.decode(Buffer.from([ 'B'.charCodeAt(0), 0x00, 0x00 ]));
    assert(Buffer.isBuffer(empty));
    assert(empty.length === 0);

    assert.deepEqual(
      hessian.encode(Buffer.from('')),
      Buffer.from([ 'B'.charCodeAt(0), 0x00, 0x00 ])
    );
  });

  it('should write and read as java impl', function() {
    let bytes = Buffer.alloc(65535);
    bytes.fill(0x41);
    let buf = hessian.encode(bytes, '1.0');
    assert(buf.length === utils.bytes('v1/bytes/65535').length);
    assert.deepEqual(buf, utils.bytes('v1/bytes/65535'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/65535'), '1.0'), bytes);

    bytes = Buffer.alloc(32768);
    bytes.fill(0x41);
    buf = hessian.encode(bytes, '1.0');
    assert(buf.length === utils.bytes('v1/bytes/32768').length);
    assert.deepEqual(buf, utils.bytes('v1/bytes/32768'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32768'), '1.0'), bytes);

    bytes = Buffer.alloc(32769);
    bytes.fill(0x41);
    buf = hessian.encode(bytes, '1.0');
    assert(buf.length === utils.bytes('v1/bytes/32769').length);
    assert.deepEqual(buf, utils.bytes('v1/bytes/32769'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32769'), '1.0'), bytes);

    bytes = Buffer.alloc(32767);
    bytes.fill(0x41);
    buf = hessian.encode(bytes, '1.0');
    assert(buf.length === utils.bytes('v1/bytes/32767').length);
    assert.deepEqual(buf, utils.bytes('v1/bytes/32767'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32767'), '1.0'), bytes);

    bytes = Buffer.alloc(32769);
    bytes.fill(0x41);
    buf = hessian.encode(bytes, '1.0');
    assert(buf.length === utils.bytes('v1/bytes/32769').length);
    assert.deepEqual(buf, utils.bytes('v1/bytes/32769'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32769'), '1.0'), bytes);

    bytes = Buffer.alloc(42769);
    bytes.fill(0x41);
    buf = hessian.encode(bytes, '1.0');
    assert(buf.length === utils.bytes('v1/bytes/42769').length);
    assert.deepEqual(buf, utils.bytes('v1/bytes/42769'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/42769'), '1.0'), bytes);

    bytes = Buffer.alloc(82769);
    bytes.fill(0x41);
    buf = hessian.encode(bytes, '1.0');
    assert(buf.length === utils.bytes('v1/bytes/82769').length);
    assert.deepEqual(buf, utils.bytes('v1/bytes/82769'));
    assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/82769'), '1.0'), bytes);
  });

  describe('v2.0', function() {
    it('should read zero length binary data', function() {
      const buf = hessian.decode(Buffer.from([ 0x20 ]), '2.0');
      assert(buf.length === 0);
      assert.deepEqual(buf, Buffer.alloc(0));
    });

    it('should read short datas', function() {
      const decoder = new hessian.DecoderV2(Buffer.from([ 0x20, 0x23, 0x23, 0x02, 0x03, 0x20 ]));
      let buf = decoder.read();
      assert(buf.length === 0);
      assert.deepEqual(buf, Buffer.alloc(0));

      buf = decoder.read();
      assert(buf.length === 3);
      assert.deepEqual(buf, Buffer.from([ 0x23, 2, 3 ]));

      buf = decoder.read();
      assert(buf.length === 0);
      assert.deepEqual(buf, Buffer.alloc(0));
    });

    it('should read max length short datas', function() {
      const input = Buffer.alloc(16);
      input.fill(0x2f);
      input[0] = 0x2f;
      const buf = hessian.decode(input, '2.0');
      assert(buf.length === 15);
      const output = Buffer.alloc(15);
      output.fill(0x2f);
      assert.deepEqual(buf, output);
    });

    it('should read long binary', function() {
      let buf = hessian.encode(Buffer.alloc(65535), '2.0');
      assert(buf[0] === 0x62);
      hessian.decode(buf, '2.0');

      buf = hessian.encode(Buffer.alloc(65536), '2.0');
      hessian.decode(buf, '2.0');

      buf = hessian.encode(Buffer.alloc(65535 * 2 - 10), '2.0');
      hessian.decode(buf, '2.0');
    });

    it('should write short binary', function() {
      assert.deepEqual(hessian.encode(Buffer.from(''), '2.0'), Buffer.from([ 0x20 ]));
    });

    it('should write and read as java impl', function() {
      let bytes = Buffer.alloc(65535);
      bytes.fill(0x41);
      let buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/65535').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/65535'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/bytes/65535'), '2.0'), bytes);

      bytes = Buffer.alloc(32768);
      bytes.fill(0x41);
      buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/32768').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/32768'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/bytes/32768'), '2.0'), bytes);

      bytes = Buffer.alloc(32769);
      bytes.fill(0x41);
      buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/32769').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/32769'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/bytes/32769'), '2.0'), bytes);

      bytes = Buffer.alloc(32767);
      bytes.fill(0x41);
      buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/32767').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/32767'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/bytes/32767'), '2.0'), bytes);

      bytes = Buffer.alloc(32769);
      bytes.fill(0x41);
      buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/32769').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/32769'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/bytes/32769'), '2.0'), bytes);

      bytes = Buffer.alloc(42769);
      bytes.fill(0x41);
      buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/42769').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/42769'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/bytes/42769'), '2.0'), bytes);

      bytes = Buffer.alloc(82769);
      bytes.fill(0x41);
      buf = hessian.encode(bytes, '2.0');
      assert(buf.length === utils.bytes('v2/bytes/82769').length);
      assert.deepEqual(buf, utils.bytes('v2/bytes/82769'));
      assert.deepEqual(hessian.decode(utils.bytes('v2/bytes/82769'), '2.0'), bytes);
    });

    it('should read java hessian 1.0 bin format', function() {
      let bytes = Buffer.alloc(65535);
      bytes.fill(0x41);
      assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/65535'), '2.0'), bytes);

      bytes = Buffer.alloc(32767);
      bytes.fill(0x41);
      assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32767'), '2.0'), bytes);

      bytes = Buffer.alloc(32768);
      bytes.fill(0x41);
      assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32768'), '2.0'), bytes);

      bytes = Buffer.alloc(32769);
      bytes.fill(0x41);
      assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32769'), '2.0'), bytes);

      bytes = Buffer.alloc(32767);
      bytes.fill(0x41);
      assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32767'), '2.0'), bytes);

      bytes = Buffer.alloc(32769);
      bytes.fill(0x41);
      assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/32769'), '2.0'), bytes);

      bytes = Buffer.alloc(42769);
      bytes.fill(0x41);
      assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/42769'), '2.0'), bytes);

      bytes = Buffer.alloc(82769);
      bytes.fill(0x41);
      assert.deepEqual(hessian.decode(utils.bytes('v1/bytes/82769'), '2.0'), bytes);
    });
  });
});
