/**!
 * hessian.js - lib/encoder.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

var assert = require('assert');
var ByteBuffer = require('byte');
var debug = require('debug')('hessian-encode');
var utils = require('./utils');

var Encoder = function () {
  //array of buffer
  if (!(this instanceof Encoder)) {
    return new Encoder();
  }
  this.byteBuffer = new ByteBuffer();
};

var proto = Encoder.prototype;

proto.writeNull = function () {
  this.byteBuffer.putChar('N');
  return this;
};

proto.writeBool = function (val) {
  this.byteBuffer.putChar(val ? 'T' : 'F');
  return this;
};

proto.writeInt = function (val) {
  this.byteBuffer
  .putChar('I')
  .putInt(val);
  return this;
};

proto.writeLong = function (val) {
  this.byteBuffer
  .putChar('L')
  .putLong(val);
  return this;
};

proto.writeDouble = function (val) {
  this.byteBuffer
  .putChar('D')
  .putLong(val);
  return this;
};

proto.writeUTCDate = function (milliEpoch) {
  this.byteBuffer
  .putChar('d')
  .putLong(milliEpoch);
};

proto.writeBytes = function (buf) {
  assert(Buffer.isBuffer(buf), 'hession writeBytes input type valid');

  // short binary
  // 0x23 0x01 0x02 0x03
  if (buf.length < 15) {
    this.byteBuffer
    .putChar(0x20 + buf.length)
    .put(buf);
    return this;
  }

  // common binary
  // b 0x80 0x00 [...]
  // B 0x00 0x03 0x01 0x02 0x03
  var offset = 0;
  while (buf.length - offset >= utils.MAX_BYTE_TRUNK_SIZE) {
    this.byteBuffer
    .putChar('b')
    .putUInt16(utils.MAX_BYTE_TRUNK_SIZE)
    .put(buf.slice(offset, offset + utils.MAX_BYTE_TRUNK_SIZE));

    offset += utils.MAX_BYTE_TRUNK_SIZE;
  }

  this.byteBuffer
  .putChar('B')
  .putUInt16(buf.length - offset)
  .put(buf.slice(offset));
  return this;
};
