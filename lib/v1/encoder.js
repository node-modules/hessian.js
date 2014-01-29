/**!
 * hessian.js - lib/encoder.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

var ByteBuffer = require('byte');
var debug = require('debug')('hessian:v1:encoder');
var utils = require('../utils');
var javaObject = require('../object');

var Encoder = function () {
  //array of buffer
  this.byteBuffer = new ByteBuffer();
  this.objects = [];
};

var proto = Encoder.prototype;

proto._assertType = function (method, expectType, val) {
  var valType = typeof val;
  var pass = expectType === 'buffer' ? Buffer.isBuffer(val) : valType === expectType;
  if (!pass) {
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
  this.byteBuffer
    .putChar('D')
    .putDouble(val);
  return this;
};

/**
 * encode date
 * 1.0: http://hessian.caucho.com/doc/hessian-1.0-spec.xtp#date
 * : d 0x00 0x00 0x00 0x00 0x10 0x32 0x33 0x12
 *
 * 2.0:
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
  this._assertType('writeString', 'string', str);
  var offset = 0;

  while (str.length - offset >= utils.MAX_CHAR_TRUNK_SIZE) {
    this.byteBuffer
      .putChar('s')
      .putUInt16(utils.MAX_BYTE_TRUNK_SIZE)
      .putRawString(str.slice(offset, offset + utils.MAX_CHAR_TRUNK_SIZE));

    offset += utils.MAX_CHAR_TRUNK_SIZE;
  }

  this.byteBuffer
    .putChar('S')
    .putUInt16(str.length - offset)
    .putRawString(str.slice(offset));

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
 * : t [0x00 0x03] i n t
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
 * : R 0x00 0x00 0x00 0x11
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
 * encode object
 *   support circular
 *   support all kind of java object
 * : {a: 1}
 * : {$class: 'java.lang.Map', $: {a: 1}}
 */
proto.writeObject = function (obj) {
  this._assertType('writeObject / writeMap', 'object', obj);
  if (obj === null) {
    debug('writeObject with a null');
    return this.writeNull();
  }

  if (this._checkRef(obj)) {
    // if is ref, will write by _checkRef
    return this;
  }

  // start with 'M'
  this.byteBuffer.putChar('M');

  var className = ''; // empty string meaning: `javaObject.DEFAULT_CLASSNAME.map`
  var realObj;
  if (!obj.$class || !obj.$) {
    // : {a: 1}
    realObj = obj;
    debug('writeObject with simple object');
  } else {
    // : {$class: 'java.utils.Map', $: {a: 1}}
    className = obj.$class === javaObject.DEFAULT_CLASSNAME.map ? '' : obj.$class;
    realObj = obj.$;
    debug('writeObject with complex object, className: %s', className);
  }

  this.writeType(className);
  for (var key in realObj) {
    this.write(key);
    this.write(realObj[key]);
  }
  //end with 'z'
  this.byteBuffer.putChar('z');
  return this;
};

proto.writeMap = proto.writeObject;

proto.writeArray = function (arr) {
  var isSimpleArray = Array.isArray(arr);
  var className = ''; // empty string meaning: `javaObject.DEFAULT_CLASSNAME.list`
  var realArray = arr;
  if (!isSimpleArray) {
    var isComplexArray = typeof arr === 'object' &&
      typeof arr.$class === 'string' && Array.isArray(arr.$);
    if (!isComplexArray) {
      throw new TypeError('hessian writeArray input type invalid');
    }

    debug('write array with a complex array with className: %S', className);

    className = arr.$class === javaObject.DEFAULT_CLASSNAME.list ? '' : arr.$class;
    realArray = arr.$;
  }

  if (this._checkRef(arr)) {
    // if is ref, will write by _checkRef
    return this;
  }

  this.byteBuffer.putChar('V');
  this.writeType(className);
  this.writeLength(realArray.length);

  debug('write array with a length of %d', realArray.length);

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
  if (val === undefined || val === null || Number.isNaN(val)) {
    return this.writeNull();
  }
  switch (type) {
  case 'boolean':
    return this.writeBool(val);
  case 'string':
    return this.writeString(val);
  case 'number':
    var isInt = parseFloat(val) === parseInt(val, 10);
    if (isInt) {
      // long
      if (val >= utils.MAX_INT_32) {
        debug('write number %d as long', val);
        return this.writeLong(val);
      }
      debug('write number %d as int', val);
      return this.writeInt(val);
    }
    // double
    debug('write number %d as double', val);
    return this.writeDouble(val);
  }

  if (val instanceof Date) {
    debug('write Date: %s', val);
    return this.writeDate(val);
  }
  if (Buffer.isBuffer(val)) {
    debug('write Buffer with a length of %d', val);
    return this.writeBytes(val);
  }
  if (Array.isArray(val)) {
    debug('write simple array with a length of %d', val.length);
    return this.writeArray(val);
  }

  // Object
  // {a: 1, b: 'test'}
  if (!val.hasOwnProperty('$class') || !val.hasOwnProperty('$')) {
    debug('write simple object');
    return this.writeObject(val);
  }

  var method = utils.getSerializer(val.$class);
  debug('write detect %s use serializer %s', val.$class, method);
  // {$class: 'long', $: 123}
  if (method !== 'writeObject' && method !== 'writeArray') {
    return this[method](val.$);
  }
  // {$class: 'java.util.Map', $: {a: 1}}
  return this[method](val);
};

Encoder.encode = function (obj) {
  return new Encoder().write(obj).get();
};

module.exports = Encoder;
