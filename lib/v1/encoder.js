/**!
 * hessian.js - lib/encoder.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

var ByteBuffer = require('byte');
var debug = require('debug')('hessian:v1:encoder');
var utils = require('../utils');
var javaObject = require('../object');
var is = require('is-type-of');

function Encoder() {
  //array of buffer
  this.byteBuffer = new ByteBuffer();
  this.objects = [];
}

var proto = Encoder.prototype;

proto._assertType = function (method, expectType, val) {
  var valType = typeof val;
  if (!is[expectType](val)) {
    var msg = 'hessian ' + method +
      ' expect input type is `' + expectType + '`, but got `' + valType + '`';
    throw new TypeError(msg);
  }
};

/**
 * get the encode buffer
 * @return {Buffer}
 */
proto.get = function () {
  return this.byteBuffer.array();
};

/**
 * clean the buf
 */
proto.clean = function () {
  this.byteBuffer = new ByteBuffer();
  this.objects = [];
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
  this._assertType('writeInt', 'int32', val);
  this.byteBuffer
    .putChar('I')
    .putInt(val);
  return this;
};

/**
 * encode long
 * warning: we won't check if the long value is out of bound, be careful!
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
  this._assertType('writeDouble', 'number', val);
  this.byteBuffer
    .putChar('D')
    .putDouble(val);
  return this;
};

/**
 * encode date
 * 1.0: http://hessian.caucho.com/doc/hessian-1.0-spec.xtp#date
 * : d 0x00 0x00 0x00 0x00 0x10 0x32 0x33 0x12
 */
proto.writeDate = function (milliEpoch) {
  if (milliEpoch instanceof Date) {
    milliEpoch = milliEpoch.getTime();
  }
  this._assertType('writeDate', 'number', milliEpoch);

  this.byteBuffer
    .putChar('d')
    .putLong(milliEpoch);
  return this;
};

/**
 * encode buffer
 * : b 0x80 0x00 [...]
 *   B 0x00 0x03 [0x01 0x02 0x03]
 */
proto.writeBytes = function (buf) {
  this._assertType('writeBytes', 'buffer', buf);
  var offset = 0;
  while (buf.length - offset > utils.MAX_BYTE_TRUNK_SIZE) {
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
  this._assertType('writeString', 'string', str);
  var offset = 0;

  var length = str.length;
  var strOffset = 0;
  while (length > 0x8000) {
    var sublen = 0x8000;
    // chunk can't end in high surrogate
    var tail = str.charCodeAt(strOffset + sublen - 1);

    if (0xd800 <= tail && tail <= 0xdbff) {
      debug('writeString got tail: 0x%s', tail.toString(16));
      sublen--;
    }

    this.byteBuffer
      .put(0x73) // 's'
      .putUInt16(sublen)
      .putRawString(str.slice(strOffset, strOffset + sublen));

    length -= sublen;
    strOffset += sublen;
    debug('writeString strOffset: %s, length: %s, sublen: %s', strOffset, length, sublen);
  }

  debug('writeString left length: %s', length);
  this.byteBuffer
    .put(0x53) // 'S'
    .putUInt16(length)
    .putRawString(str.slice(strOffset));

  return this;
};

/**
 * encode length
 * : l 0x04 0x11 0xef 0x22
 */
proto.writeLength = function (length) {
  this.byteBuffer
    .putChar('l')
    .putUInt(length);

  return this;
};

/**
 * encode type
 * v1.0
 * ```
 * type ::= 0x74(t) type-string-length(putUInt16) type-string(putRawString)
 * ```
 */
proto.writeType = function (type) {
  type = type || '';
  this._assertType('writeType', 'string', type);
  this.byteBuffer
    .putChar('t')
    .putUInt16(type.length)
    .putRawString(type);

  return this;
};

/**
 * encode ref
 * v1.0
 * ```
 * ref ::= R(0x52) int(putInt)
 * ```
 */
proto.writeRef = function (refId) {
  this.byteBuffer
    .putChar('R')
    .putInt(refId);

  return this;
};

proto._checkRef = function (obj) {
  var refIndex = this.objects.indexOf(obj);
  if (refIndex >= 0) {
    // already have this object
    // just write ref
    debug('writeObject with a refIndex: %d', refIndex);
    this.writeRef(refIndex);
    return true;
  }
  // a new comming object
  this.objects.push(obj);
  return false;
};

/**
 * A sparse array
 *
 * @param {Object} obj simple obj
 * @return {this}
 */
proto._writeHashMap = function (obj) {
  debug('_writeHashMap() %j, fields: %j', obj);

  // Real code in java impl:
  // http://grepcode.com/file/repo1.maven.org/maven2/com.caucho/hessian/3.1.3/com/caucho/hessian/io/Hessian2Output.java#Hessian2Output.writeMapBegin%28java.lang.String%29
  // M(0x4d) type b16 b8 (<key> <value>)z
  this.byteBuffer.put(0x4d);
  // hashmap's type is null
  this.writeType('');

  // hash map must sort keys
  var keys = Object.keys(obj).sort();
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    this.write(k);
    this.write(obj[k]);
  }
  // 'z(x7a)'
  this.byteBuffer.put(0x7a);
  return this;
};

proto._writeObject = function (obj) {
  this.byteBuffer.put(0x4d);
  this.writeType(obj.$class);

  var val = obj.$;
  for (var k in val) {
    this.write(k);
    this.write(val[k]);
  }
  // 'z(x7a)'
  this.byteBuffer.put(0x7a);
  return this;
};

/**
 * encode object
 *   support circular
 *   support all kind of java object
 * : {a: 1}
 * : {$class: 'java.lang.Map', $: {a: 1}}
 */
proto.writeObject = function (obj) {
  if (is.nullOrUndefined(obj)) {
    debug('writeObject with a null');
    return this.writeNull();
  }
  this._assertType('writeObject / writeMap', 'object', obj);

  if (this._checkRef(obj)) {
    // if is ref, will write by _checkRef
    return this;
  }

  var className = '';
  var realObj;
  if (!obj.$class || !obj.$) {
    // : {a: 1}
    realObj = obj;
  } else {
    // : {$class: 'java.utils.HashMap', $: {a: 1}}
    className = obj.$class === javaObject.DEFAULT_CLASSNAME.map ? '' : obj.$class;
    realObj = obj.$;
  }

  if (!className) {
    return this._writeHashMap(realObj);
  }

  debug('writeObject with complex object, className: %s', className);
  return this._writeObject(obj);
};

proto.writeMap = proto.writeObject;

proto.writeArray = function (arr) {
  var isSimpleArray = is.array(arr);
  var className = ''; // empty string meaning: `javaObject.DEFAULT_CLASSNAME.list`
  var realArray = arr;
  if (!isSimpleArray) {
    var isComplexArray = is.object(arr) &&
      is.string(arr.$class) && is.array(arr.$);
    if (!isComplexArray) {
      throw new TypeError('hessian writeArray input type invalid');
    }

    debug('write array with a complex array with className: %s', className);

    className = arr.$class === javaObject.DEFAULT_CLASSNAME.list ? '' : arr.$class;
    realArray = arr.$;
  }

  if (this._checkRef(arr)) {
    // if is ref, will write by _checkRef
    return this;
  }

  this.byteBuffer.putChar('V');

  if (className) {
    this.writeType(className);
  }

  this.writeLength(realArray.length);

  debug('write array with a length of %s', realArray.length);

  for (var i = 0; i < realArray.length; i++) {
    this.write(realArray[i]);
  }
  this.byteBuffer.putChar('z');
  return this;
};

proto.writeList = proto.writeArray;

/**
 * write any type
 * @param {Object|Number|String|Boolean|Array} val
 * : 1 => int
 * : 1.1 => double
 * :
 */
proto.write = function (val) {
  var type = typeof val;
  if (is.nullOrUndefined(val) || is.NaN(val)) {
    return this.writeNull();
  }
  switch (type) {
  case 'boolean':
    return this.writeBool(val);
  case 'string':
    return this.writeString(val);
  case 'number':
    if (is.long(val)) {
      debug('write number %d as long', val);
      return this.writeLong(val);
    }
    if (is.int(val)) {
      debug('write number %d as int', val);
      return this.writeInt(val);
    }
    // double
    debug('write number %d as double', val);
    return this.writeDouble(val);
  }

  if (is.long(val)) {
    debug('write long: high: %s, low: %s', val.high, val.low);
    return this.writeLong(val);
  }

  if (is.date(val)) {
    debug('write Date: %s', val);
    return this.writeDate(val);
  }
  if (is.buffer(val)) {
    debug('write Buffer with a length of %d', val.length);
    return this.writeBytes(val);
  }
  if (is.array(val)) {
    debug('write simple array with a length of %d', val.length);
    return this.writeArray(val);
  }

  // Object
  // {a: 1, b: 'test'}
  // {a: 0, b: null}
  if (!is.string(val.$class) || !utils.hasOwnProperty(val, '$')) {
    debug('write simple object');
    return this.writeObject(val);
  }

  if (is.array(val.$)) {
    debug('detect val.$ is array');
    return this.writeArray(val);
  }

  var method = utils.getSerializer(val.$class);
  debug('write detect %s use serializer %s', val.$class, method);

  // {$class: 'long', $: 123}
  if (method !== 'writeObject' && method !== 'writeArray') {
    return this[method](val.$);
  }

  // java.lang.Object
  if (utils.isJavaObject(val.$class)) {
    if (is.date(val.$) || !is.object(val.$)) {
      return this.write(val.$);
    }
  }

  // {$class: 'java.util.Map', $: {a: 1}}
  return this[method](val);
};

module.exports = Encoder;
