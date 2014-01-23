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

/**
 * clean the buf
 */
proto.clean = function () {
  this.byteBuffer = new ByteBuffer();
  return this;
};

/**
 * encode null
 * : N
 */
proto.writeNull = function () {
  this.byteBuffer.putChar('N');
  return this;
};

/**
 * encode bool
 * : T
 * : F
 */
proto.writeBool = function (val) {
  this.byteBuffer.putChar(val ? 'T' : 'F');
  return this;
};

/**
 * encode int
 * : I 0x00 0x00 0x00 0x10
 */
proto.writeInt = function (val) {
  this.byteBuffer
  .putChar('I')
  .putInt(val);
  return this;
};

/**
 * encode long
 * : L 0x00 0x00 0x00 0x00 0x10 0x32 0x33 0x12
 */
proto.writeLong = function (val) {
  this.byteBuffer
  .putChar('L')
  .putLong(val);
  return this;
};

/**
 * encode double
 * : D 0x00 0x00 0x00 0x00 0x10 0x32 0x33 0x12
 */
proto.writeDouble = function (val) {
  this.byteBuffer
  .putChar('D')
  .putDouble(val);
  return this;
};

/**
 * encode date
 * : d 0x00 0x00 0x00 0x00 0x10 0x32 0x33 0x12
 */
proto.writeUTCDate = function (milliEpoch) {
  this.byteBuffer
  .putChar('d')
  .putLong(milliEpoch);
};

/**
 * encode buffer
 * : b 0x80 0x00 [...]
 *   B 0x00 0x03 [0x01 0x02 0x03]
 */
proto.writeBytes = function (buf) {
  assert(Buffer.isBuffer(buf), 'hession writeBytes input type invalid');

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

/**
 * encode string
 * : s 0x80 0x00 [...]
 *   S 0x00 0x03 [0x01 0x02 0x03]
 */
proto.writeString = function (str) {
  assert(typeof str === 'string', 'hession writeString input type invalid');

  var offset = 0;

  while (str.length - offset >= utils.MAX_CHAR_TRUNK_SIZE) {
    this.byteBuffer
    .putChar('s')
    .putUInt16(utils.MAX_BYTE_TRUNK_SIZE)
    .putString(str.slice(offset, offset + utils.MAX_CHAR_TRUNK_SIZE));

    offset += utils.MAX_CHAR_TRUNK_SIZE;
  }

  this.byteBuffer
  .putChar('S')
  .putUInt16(str.length - offset)
  .putString(str.slice(offset));

  return this;
};

/**
 * encode length
 * : l 0x04 0x11 0xef 0x22
 */
proto.writeLength = function (length) {
  this.ByteBuffer
  .putChar('l')
  .putUInt32(length);

  return this;
};

/**
 * encode type
 * : t [0x00 0x03] i n t
 */
proto.writeType = function (type) {
  assert(typeof type === 'string', 'hessian writeType input type invalid');
  this.ByteBuffer
  .putChar('t')
  .putUInt16(type.length)
  .putString(type);

  return this;
};

/**
 * encode ref
 * : R 0x00 0x00 0x00 0x11
 */
proto.writeRef = function (refId) {
  this.ByteBuffer
  .putChar('R')
  .putInt32(refId);

  return this;
};

module.exports = Encoder;
