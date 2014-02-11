/**!
 * hessian.js - lib/v1/decoder.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

var ByteBuffer = require('byte');
var debug = require('debug')('hessian:v1:decoder');
var utils = require('../utils');

function Decoder(buf) {
  this.byteBuffer = buf ? ByteBuffer.wrap(buf) : null;
  this.refMap = {};
  this.refId = 0;
}

/**
 * prototype of Decoder
 */
var proto = Decoder.prototype;

proto._addRef = function (obj) {
  this.refMap[this.refId++] = obj;
};

/**
 * init from a buffer
 * @param {Buffer} buf
 * @api public
 */
proto.init = function (buf) {
  this.byteBuffer = ByteBuffer.wrap(buf);
  return this;
};

/**
 * clean the decoder
 * @api public
 */
proto.clean = function () {
  this.byteBuffer = new ByteBuffer();
  this.refMap = {};
  this.refId = 0;
  return this;
};

/**
 * check if the label match the method
 * @api private
 */
proto._checkLabel = function (method, label) {
  var l = this.byteBuffer.getChar();
  var labelIsOk = l === label || label.indexOf(l) >= 0;
  if (!labelIsOk) {
    throw new TypeError('hessian ' + method + ' only accept label `' + label +
      '` but got unexpect label `' + l + '`');
  }
  return l;
};

/**
 * read a null from buffer
 *
 * v1.0
 * ```
 * null ::= N
 * ```
 *
 * @return {Null}
 * @api public
 */
proto.readNull = function () {
  this._checkLabel('readNull', 'N');
  return null;
};

/**
 * read a boolean from buffer
 *
 * v1.0
 * ```
 * boolean ::= T
 *         ::= F
 * ```
 *
 * @return {Boolean}
 * @api public
 */
proto.readBool = function () {
  var label = this._checkLabel('readBool', ['T', 'F']);
  return label === 'T';
};

/**
 * read a int from buffer
 *
 * v1.0
 * ```
 * int ::= I b32 b24 b16 b8
 * ```
 *
 * @return {Number}
 * @api public
 */
proto.readInt = function () {
  this._checkLabel('readInt', 'I');
  return this.byteBuffer.getInt();
};

/**
 * read a long from buffer
 *
 * v1.0
 * ```
 * long ::= L b64 b56 b48 b40 b32 b24 b16 b8
 * ```
 *
 * @return {Number}
 * @api public
 */
proto.readLong = function () {
  this._checkLabel('readLong', 'L');
  return utils.handleLong(this.byteBuffer.getLong());
};

/**
 * read a double from buffer
 *
 * v1.0
 * ```
 * double ::= D b64 b56 b48 b40 b32 b24 b16 b8
 * ```
 *
 * @return {Number}
 * @api public
 */
proto.readDouble = function () {
  this._checkLabel('readDouble', 'D');
  return this.byteBuffer.getDouble();
};

/**
 * read a date from buffer,
 * v1.0 Date Grammar
 * ```
 * date ::= d b64 b56 b48 b40 b32 b24 b16 b8
 * // Date represented by a 64-bit long of milliseconds since Jan 1 1970 00:00H, UTC.
 * ```
 *
 * @return {Date}
 * @api public
 */
proto.readDate = function () {
  this._checkLabel('readDate', ['d', 'J']);
  var date = utils.handleLong(this.byteBuffer.getLong());
  debug('read a date with milliEpoch: %d', date);
  return new Date(date);
};

/**
 * read bytes from buffer
 *
 * v1.0
 * ```
 * binary ::= (b b16 b8 binary-data)* B b16 b8 binary-data
 * ```
 * Binary data is encoded in chunks.
 * 'B' represents the final chunk and
 * 'b' represents any initial chunk. Each chunk has a 16-bit length value.
 *
 * @return {Buffer}
 * @api public
 */
proto.readBytes = function () {
  var label = this._checkLabel('readBytes', ['b', 'B']);
  var bufs = [];
  var length = 0;
  // get all trunk start with 'b'
  while (label === 'b') {
    length = this.byteBuffer.getUInt16();
    bufs.push(this.byteBuffer.read(length));
    label = this._checkLabel('readBytes', ['b', 'B']);
  }
  // get the last trunk start with 'B'
  length = this.byteBuffer.getUInt16();
  bufs.push(this.byteBuffer.read(length));

  return Buffer.concat(bufs);
};

proto._readUTF8String = function (len) {
  if (typeof len !== 'number') {
    len = this.byteBuffer.getUInt16();
  }

  var startPos = this.byteBuffer.position();
  var head;
  var l;
  debug('read utf8 string tunk, chars length: %d', len);

  if (len === 0) {
    return '';
  }

  while (len--) {
    head = this.byteBuffer.get();
    l = utils.lengthOfUTF8(head);
    this.byteBuffer.skip(l - 1);
  }
  debug('get string trunk. start position: %d, byte length: %d',
    startPos, this.byteBuffer.position() - startPos);

  return this.byteBuffer.getRawString(startPos, this.byteBuffer.position() - startPos);
};

/**
 * read a string from buffer
 *
 * The length is the number of characters, which may be different than the number of bytes.
 *
 * v1.0
 * ```
 * string ::= (s(x73) b16 b8 utf-8-data)* S(x53) b16 b8 utf-8-data
 * ```
 *
 * @return {String}
 * @api public
 */
proto.readString = function () {
  var str = '';
  var code = this.byteBuffer.get();
  // get all trunk start with 's'
  while (code === 0x73) {
    str += this._readUTF8String();
    code = this.byteBuffer.get();
  }

  if (code === 0x53) {
    // x53 ('S') represents the final chunk
    debug('read last trunk of string');
    str += this._readUTF8String();
  } else {
    // error format
    throw new TypeError('hessian readString error, unexpect string code: 0x' + code.toString(16));
  }

  return str;
};

/**
 * v1.0
 * ```
 * t b16 b8 type-string
 * ```
 *
 * @param {Boolean} skip skip type, if true, will return empty string
 * @return {String} type string
 */
proto.readType = function (skip) {
  this._checkLabel('readType', 't');
  var typeLength = this.byteBuffer.getUInt16();
  if (skip) {
    this.byteBuffer.skip(typeLength);
    debug('ignore type, skip %d bytes', typeLength);
    return '';
  } else {
    var type = this.byteBuffer.readRawString(typeLength);
    debug('get type: %s', type);
    return type;
  }
};

proto.readLength = function () {
  this._checkLabel('readLength', 'l');
  var len = this.byteBuffer.getUInt();
  debug('read length: %s', len);
  return len;
};

/**
 * A sparse array, hessian v1.0
 * http://hessian.caucho.com/doc/hessian-1.0-spec.xtp#map
 */
proto._readSparseObject = function (withType) {
  var obj = {};
  var label = this.byteBuffer.getChar(this.byteBuffer.position());
  while (label !== 'z') {
    debug('sparse array label: %s', label);
    var key = this.read(withType);
    var val = this.read(withType);
    obj[key] = val;
    label = this.byteBuffer.getChar(this.byteBuffer.position());
  }
  // skip 'z' char
  this.byteBuffer.position(this.byteBuffer.position() + 1);
  return obj;
};

/**
 * read an object from buffer
 *
 * v1.0
 * ```
 * map ::= M t b16 b8 type-string (object, object)* z
 * ```
 *
 * @param {Boolean} withType if need retain the type info
 * @return {Object}
 * @api public
 */
proto.readObject = function (withType) {
  this._checkLabel('readObject', 'M');
  debug('start read an object');
  var typeLabel = this.byteBuffer.getChar(this.byteBuffer.position());
  if (typeLabel !== 't') {
    debug('read sparse object, start label: %s', typeLabel);
    return this._readSparseObject(withType);
  }

  var type = this.readType(!withType);
  // if object is 'java.util.HashMap', type will be ''

  // put object into reaResult
  var realResult =  {};
  // result is the output
  var result = realResult;

  if (withType && type) {
    result = {
      $class: type,
      $: realResult
    };
  }
  this._addRef(result);

  // get
  var label = this.byteBuffer.getChar();
  var key;
  while (label !== 'z') {
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    key = this.readString();
    debug('read object prop: %j with type: %s', key, withType);
    realResult[key] = this.read(withType);
    label = this.byteBuffer.getChar();
  }
  debug('read object finish');
  return result;
};

/**
 * read an map from buffer
 *
 * v1.0
 * ```
 * map ::= M t b16 b8 type-string (object, object)* z
 * ```
 *
 * @param {Boolean} withType if need retain the type info
 * @return {Object}
 * @api public
 */
proto.readMap = proto.readObject;

/**
 * anonymous variable-length list = {0, "foobar"}
 * http://hessian.caucho.com/doc/hessian-1.0-spec.xtp#list
 */
proto._readNoLengthArray = function (withType) {
  var arr = [];
  var label = this.byteBuffer.getChar(this.byteBuffer.position());
  while (label !== 'z') {
    debug('no length array item#%d label: %s', arr.length, label);
    arr.push(this.read(withType));
    label = this.byteBuffer.getChar(this.byteBuffer.position());
  }
  // skip 'z' char
  this.byteBuffer.position(this.byteBuffer.position() + 1);
  return arr;
};

/**
 * read an array from buffer
 *
 * v1.0
 * ```
 * list ::= V type? length? object* z
 * ```
 *
 * @param {Boolean} withType if need retain the type info
 * @return {Array}
 * @api public
 */
proto.readArray = function (withType) {
  debug('start read an array');
  this._checkLabel('readArray', 'V');
  var typeLabel = this.byteBuffer.getChar(this.byteBuffer.position());
  if (typeLabel !== 't') {
    debug('read no length array, start label: %s', typeLabel);
    return this._readNoLengthArray(withType);
  }

  var type = this.readType(!withType);
  // if object is 'java.util.ArrayList', type will be ''

  var realResult = [];
  var result = realResult;

  if (withType && type) {
    result = {
      $class: type,
      $: realResult
    };
  }

  this._addRef(result);

  var len = this.readLength();
  while (len--) {
    realResult.push(this.read(withType));
  }
  var endLabel = this.byteBuffer.getChar();
  if (endLabel !== 'z') {
    throw new TypeError('hessian readArray error, unexpect end label: ' + endLabel);
  }
  debug('read array finished with a length of %d', realResult.length);
  return result;
};

proto.readList = proto.readArray;

/**
 * v1.0
 * ```
 * ref ::= R(x52) b32 b24 b16 b8
 * ```
 *
 * @return {Object}
 */
proto.readRef = function (withType) {
  this._checkLabel('readRef', 'R');
  var refId = this.byteBuffer.getInt();
  debug('read a ref with id: %d', refId);
  var obj = this.refMap[refId];
  if (!withType) {
    obj = obj.$ || obj;
  }
  return obj;
};

/**
 * read any thing
 * @param {Boolean} withType if need retain the type info
 * @api public
 */
proto.read = function (withType) {
  var offset = this.byteBuffer.position();
  var code = this.byteBuffer.get();
  if (code === undefined) {
    throw new Error('hessian read the end of buffer');
  }
  var label = String.fromCharCode(code);

  debug('read label: %s', label);

  switch (label) {
  case 'N':
    return null;
  case 'T':
    return true;
  case 'F':
    return false;
  case 'I':
    return this.byteBuffer.getInt();
  case 'L':
    return utils.handleLong(this.byteBuffer.getLong());
  case 'D':
    return this.byteBuffer.getDouble();
  case 'd':
    this.byteBuffer.position(offset);
    return this.readDate();
  case 'S': // utf-8 string final chunk ('S')
    this.byteBuffer.position(offset);
    return this.readString();
  case 's':
    this.byteBuffer.position(offset);
    // x70 - x77    # fixed list with direct length (p, q, r, s, t, u, v, w)
    // if (this.isV2) {
    //   return this.readArrayV2(withType);
    // }

    // x73, hessian 1.0, meaning string non-final chunk
    return this.readString();
  case 'B':
  case 'b':
    this.byteBuffer.position(offset);
    return this.readBytes();
  case 'M':
    this.byteBuffer.position(offset);
    return this.readObject(withType);
  case 'V':
    this.byteBuffer.position(offset);
    return this.readArray(withType);
  case 'R':
    this.byteBuffer.position(offset);
    return this.readRef(withType);
  default:
    // Compact string
    if (code >= 0x00 && code <= 0x1f) {
      this.byteBuffer.position(offset);
      return this.readString();
    }

    // Compact object, hessian 2.0
    if (code >= 0x60 && code <= 0x6f) {
      this.byteBuffer.position(offset);
      return this.readObjectV2(withType);
    }

    // List, hessian 2.0
    if ((code >= 0x55 && code <= 0x58) ||
        (code >= 0x70 && code <= 0x7f)) {
      this.byteBuffer.position(offset);
      return this.readArrayV2(withType);
    }

    // may be compact types
    return this._readCompactTypes(code);
  }
};

proto._readCompactTypes = function (code) {
  if (code >= 0x20 && code <= 0x2f) {
    // short binary
    var len = code - 0x20;
    return this.byteBuffer.read(len);
  }
  // Compact double
  if (code === 0x5b) {
    return 0.0;
  }
  if (code === 0x5c) {
    return 1.0;
  }
  if (code === 0x5d) {
    return this.byteBuffer.getInt8();
  }
  if (code === 0x5e) {
    return this.byteBuffer.getInt16();
  }
  if (code === 0x5f) {
    return this.byteBuffer.getFloat();
  }

  // Compact int
  if (code >= 0x80 && code <= 0xbf) {
    // Integers between -16 and 47 can be encoded by a single octet in the range x80 to xbf.
    // value = code - 0x90
    return code - 0x90;
  }
  if (code >= 0xc0 && code <= 0xcf) {
    // Integers between -2048 and 2047 can be encoded in two octets with the leading byte in the range xc0 to xcf.
    // value = ((code - 0xc8) << 8) + b0;
    return ((code - 0xc8) << 8) + this.byteBuffer.get();
  }
  if (code >= 0xd0 && code <= 0xd7) {
    // Integers between -262144 and 262143 can be encoded in three bytes with the leading byte in the range xd0 to xd7.
    // value = ((code - 0xd4) << 16) + (b1 << 8) + b0;
    var b1 = this.byteBuffer.get();
    var b0 = this.byteBuffer.get();
    return ((code - 0xd4) << 16) + (b1 << 8) + b0;
  }

  // Compact long
  if (code >= 0xd8 && code <= 0xef) {
    // Longs between -8 and 15 are represented by a single octet in the range xd8 to xef.
    // value = (code - 0xe0)
    return code - 0xe0;
  }
  if (code >= 0xf0 && code <= 0xff) {
    // Longs between -2048 and 2047 are encoded in two octets with the leading byte in the range xf0 to xff.
    // value = ((code - 0xf8) << 8) + b0
    return ((code - 0xf8) << 8) + this.byteBuffer.get();
  }
  if (code >= 0x38 && code <= 0x3f) {
    // Longs between -262144 and 262143 are encoded in three octets with the leading byte in the range x38 to x3f.
    // value = ((code - 0x3c) << 16) + (b1 << 8) + b0
    var b1 = this.byteBuffer.get();
    var b0 = this.byteBuffer.get();
    return ((code - 0x3c) << 16) + (b1 << 8) + b0;
  }
  // ::= x59 b3 b2 b1 b0       # 32-bit integer cast to long
  if (code === 0x59) {
    // Longs between which fit into 32-bits are encoded in five octets with the leading byte x59.
    // value = (b3 << 24) + (b2 << 16) + (b1 << 8) + b0
    return this.byteBuffer.getInt32();
  }

  throw new Error('hessian read got an unexpect label: 0x' + code.toString(16));
};

/**
 * set or get decoder byteBuffer position
 */
proto.position = function (num) {
  if (typeof num === 'number') {
    this.byteBuffer.position(num);
    return this;
  }

  return this.byteBuffer.position();
};

Decoder.decode = function (buf, withType, hessianVersion) {
  if (typeof withType === 'string') {
    // decode(buf, '2.0', withType)
    var t = hessianVersion;
    hessianVersion = withType;
    withType = t;
  }
  return new Decoder(buf, hessianVersion).read(withType);
};

module.exports = Decoder;
