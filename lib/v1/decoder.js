/**
 * hessian.js - lib/v1/decoder.js
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

var debug = require('debug')('hessian:v1:decoder');
var ByteBuffer = require('byte');
var is = require('is-type-of');
var utils = require('../utils');
var object = require('../object');
var JavaExceptionError = object.JavaExceptionError;
var supportES6Map = require('../utils').supportES6Map;

var BYTE_CODES = {};

function Decoder(buf) {
  this.byteBuffer = buf ? ByteBuffer.wrap(buf) : null;
  this.refMap = {};
  this.refId = 0;
  this.BYTE_CODES = BYTE_CODES;
}

/**
 * prototype of Decoder
 */

var proto = Decoder.prototype;

proto.throwError = function (method, code) {
  throw new TypeError('hessian ' + method + ' error, unexpect code: 0x' + code.toString(16));
};

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

proto.handleType = function(type, val, withType) {
  return withType ? {$class: object.DEFAULT_CLASSNAME[type], $: val} : val;
};

/**
 * read a null from buffer
 *
 * v1.0
 * ```
 * null ::= N(x4e)
 * ```
 *
 * @return {Null}
 * @api public
 */
proto.readNull = function () {
  this._checkLabel('readNull', 'N');
  return null;
};

utils.addByteCodes(BYTE_CODES, [
  0x4e,
], 'readNull');

/**
 * read a boolean from buffer
 *
 * v1.0
 * ```
 * boolean ::= T(x54)
 *         ::= F(x46)
 * ```
 *
 * @return {Boolean}
 * @api public
 */
proto.readBool = function (withType) {
  var label = this._checkLabel('readBool', ['T', 'F']);
  var val = label === 'T';
  return this.handleType('boolean', val, withType);
};

utils.addByteCodes(BYTE_CODES, [
  0x54,
  0x46,
], 'readBool');

/**
 * read a int from buffer
 *
 * v1.0
 * ```
 * int ::= I(x49) b32 b24 b16 b8
 * ```
 *
 * @return {Number}
 * @api public
 */
proto.readInt = function (withType) {
  this._checkLabel('readInt', 'I');
  var val = this.byteBuffer.getInt();
  return this.handleType('int', val, withType);
};

utils.addByteCodes(BYTE_CODES, [
  0x49
], 'readInt');

/**
 * read a long from buffer
 *
 * v1.0
 * ```
 * long ::= L(x4c) b64 b56 b48 b40 b32 b24 b16 b8
 * ```
 *
 * @return {Number}
 * @api public
 */
proto.readLong = function (withType) {
  this._checkLabel('readLong', 'L');
  var val = utils.handleLong(this.byteBuffer.getLong());
  return this.handleType('long', val, withType);
};

utils.addByteCodes(BYTE_CODES, [
  0x4c
], 'readLong');

/**
 * read a double from buffer
 *
 * v1.0
 * ```
 * double ::= D(x44) b64 b56 b48 b40 b32 b24 b16 b8
 * ```
 *
 * @return {Number}
 * @api public
 */
proto.readDouble = function (withType) {
  this._checkLabel('readDouble', 'D');
  var val = this.byteBuffer.getDouble();
  return this.handleType('double', val, withType);
};

utils.addByteCodes(BYTE_CODES, [
  0x44
], 'readDouble');

/**
 * read a date from buffer
 *
 * v1.0
 * ```
 * date ::= d(x64) b64 b56 b48 b40 b32 b24 b16 b8
 * ```
 * Date represented by a 64-bit long of milliseconds since Jan 1 1970 00:00H, UTC.
 *
 * @return {Date}
 * @api public
 */
proto.readDate = function (withType) {
  this._checkLabel('readDate', 'd');
  var date = utils.handleLong(this.byteBuffer.getLong());
  debug('read a date with milliEpoch: %d', date);
  var val = new Date(date);
  return this.handleType('date', val, withType);
};

utils.addByteCodes(BYTE_CODES, [
  0x64
], 'readDate');

/**
 * read bytes from buffer
 *
 * v1.0
 * ```
 * binary ::= (b(x62) b16 b8 binary-data)* B(x42) b16 b8 binary-data
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

utils.addByteCodes(BYTE_CODES, [
  0x62,
  0x42
], 'readBytes');

proto._readUTF8String = function (len) {
  if (!is.number(len)) {
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
proto.readString = function (withType) {
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
  return this.handleType('string', str, withType);
};

utils.addByteCodes(BYTE_CODES, [
  0x73,
  0x53
], 'readString');

/**
 * v1.0
 * ```
 * t(x74) b16 b8 type-string
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

utils.addByteCodes(BYTE_CODES, [
  0x74,
], 'readType');

proto.readLength = function () {
  this._checkLabel('readLength', 'l'); // x6c
  var len = this.byteBuffer.getUInt();
  debug('read length: %s', len);
  return len;
};

utils.addByteCodes(BYTE_CODES, [
  0x6c,
], 'readLength');

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

  // default type info
  if (withType) {
    return {
      $class: object.DEFAULT_CLASSNAME.map,
      $: obj
    };
  }

  return obj;
};

/**
 * read an object from buffer
 *
 * v1.0
 * ```
 * map ::= M(x4d) t b16 b8 type-string (object, object)* z
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

  var type = this.readType(false) || object.DEFAULT_CLASSNAME.map;
  // if object is 'java.util.HashMap', type will be ''

  var result = {
    $class: type,
    $: {}
  };
  var isMap = (type.indexOf(object.DEFAULT_CLASSNAME.map) === 0 ||
    type.indexOf(object.DEFAULT_CLASSNAME.iMap) === 0) && supportES6Map;

  if (isMap) {
    Object.defineProperty(result.$, '$map', {
      value: new Map(),
      enumerable: false,
    });
  }

  this._addRef(result);

  // get
  var label = this.byteBuffer.getChar();
  var key;

  while (label !== 'z') {
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    key = this.read();
    var value = this.read(withType);
    label = this.byteBuffer.getChar();
    // property name will auto transfer to a String type.
    debug('read object prop: %j with type: %s', key, withType);
    if (!/^this\$\d+$/.test(key)) {
      result.$[key] = value;
    }
    if (isMap) {
      result.$.$map.set(key, value);
    }
  }
  debug('read object finish');

  // java.lang.NoClassDefFoundError
  if (/Exception$/.test(type) || /^java\.lang\.\w+Error$/.test(type)) {
    result.$ = new JavaExceptionError(result, withType);
  }

  return withType ? result : result.$;
};

utils.addByteCodes(BYTE_CODES, [
  0x4d,
], 'readObject');

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
proto._readNoLengthArray = function (withType, type) {
  var arr = [];
  var label = this.byteBuffer.getChar(this.byteBuffer.position());
  while (label !== 'z') {
    debug('no length array item#%d label: %s', arr.length, label);
    arr.push(this.read(withType));
    label = this.byteBuffer.getChar(this.byteBuffer.position());
  }
  // skip 'z' char
  this.byteBuffer.position(this.byteBuffer.position() + 1);

  arr = withType
  ? { $class: type, $: arr }
  : arr;
  return arr;
};

/**
 * read an array from buffer
 *
 * v1.0
 * ```
 * list ::= V(x56) type? length? object* z
 * ```
 *
 * @param {Boolean} withType if need retain the type info
 * @return {Array}
 * @api public
 */
proto.readArray = function (withType) {
  debug('start read an array');
  this._checkLabel('readArray', 'V');
  var type = '';

  var typeLabel = this.byteBuffer.getChar(this.byteBuffer.position());
  if (typeLabel === 't') {
    type = this.readType(!withType);
  }
  type = type || object.DEFAULT_CLASSNAME.list;

  var lengthLabel = this.byteBuffer.getChar(this.byteBuffer.position());
  if (lengthLabel !== 'l') {
    debug('read no length array, start label: %s', typeLabel);
    return this._readNoLengthArray(withType, type);
  }

  // if object is 'java.util.ArrayList', type will be ''

  var realResult = [];
  var result = realResult;

  if (withType) {
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

utils.addByteCodes(BYTE_CODES, [
  0x56,
], 'readArray');

proto.readList = proto.readArray;

/**
 * Get a object by ref id
 *
 * @return {Object}
 */
proto.readRef = function (withType) {
  var rid = this.readRefId();
  var obj = this.refMap[rid];
  if (!withType && obj && utils.hasOwnProperty(obj, '$')) {
    obj = obj.$;
  }
  return obj;
};

/**
 * v1.0
 * ```
 * ref ::= R(x52) b32 b24 b16 b8
 * ```
 *
 * @return {Number}
 */
proto.readRefId = function (withType) {
  this._checkLabel('readRef', 'R');
  return this.byteBuffer.getInt();
};

utils.addByteCodes(BYTE_CODES, [
  0x52,
], 'readRef');

/**
 * read any thing
 *
 * @param {Boolean} withType if need retain the type info
 * @api public
 */
proto.read = function (withType) {
  var pos = this.byteBuffer.position();
  var code = this.byteBuffer.get(pos);
  var method = this.BYTE_CODES[code];
  if (debug.enabled) {
    debug('read position: %s, code: 0x%s, method: %s', pos, code.toString(16), method);
  }

  if (!method) {
    throw new Error('hessian read got an unexpect code: 0x' + code.toString(16));
  }

  return this[method](withType);
};

/**
 * set or get decoder byteBuffer position
 */
proto.position = function (num) {
  if (is.number(num)) {
    this.byteBuffer.position(num);
    return this;
  }

  return this.byteBuffer.position();
};

module.exports = Decoder;
