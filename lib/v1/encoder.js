/**
 * hessian.js - lib/encoder.js
 * Copyright(c)
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
var supportES6Map = require('../utils').supportES6Map;

function Encoder(options) {
  options = options || {};
  //array of buffer
  this.byteBuffer = new ByteBuffer({
    size: options.size
  });
  this.objects = [];
}

var proto = Encoder.prototype;

proto._assertType = function (method, expectType, val, desc) {
  var valType = typeof val;
  if (!is[expectType](val)) {
    var msg = 'hessian ' + method +
      ' expect input type is `' + expectType + '`, but got `' + valType + '`' + ' : ' + JSON.stringify(val) + ' ' + (desc || '');
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
proto.reset = proto.clean = function () {
  this.byteBuffer.reset();
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

var _typecache = {};

/**
 * encode type
 * v1.0
 * ```
 * type ::= 0x74(t) type-string-length(putUInt16) type-string(putRawString)
 * ```
 */
proto.writeType = function (type) {
  type = type || '';
  if (_typecache[type]) {
    this.byteBuffer.put(_typecache[type]);
    return this;
  }

  var start = this.byteBuffer.position();

  this.byteBuffer
    .put(0x74)
    .putUInt16(type.length)
    .putRawString(type);

  var end = this.byteBuffer.position();
  _typecache[type] = this.byteBuffer.copy(start, end);

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
  // M(0x4d) type(writeType) (<key> <value>) z(0x7a)
  this.byteBuffer.put(0x4d);
  // hashmap's type is null
  this.writeType('');

  if (supportES6Map && obj instanceof Map) {
    obj.forEach(function (value, key) {
      this.write(key);
      this.write(value);
    }, this);
  } else {
    // hash map must sort keys
    var keys = Object.keys(obj).sort();
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      this.writeString(k);
      this.write(obj[k]);
    }
  }
  this.byteBuffer.put(0x7a);
  return this;
};

// M(0x4d) type(writeType) (<key> <value>) z(0x7a)
proto._writeObject = function (obj) {
  this._assertType('writeObject / writeMap', 'object', obj.$, obj.$class);
  this.byteBuffer.put(0x4d);
  this.writeType(obj.$class);

  var val = obj.$;
  var keys = Object.keys(val);
  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    this.writeString(key);
    this.write(val[key]);
  }
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
  if (is.nullOrUndefined(obj) || 
    // : { a: { '$class': 'xxx', '$': null } }
    (is.string(obj.$class) && is.nullOrUndefined(obj.$))) {
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
    // : {$class: 'java.util.HashMap', $: {a: 1}}
    className = obj.$class === javaObject.DEFAULT_CLASSNAME.map || obj.$class === javaObject.DEFAULT_CLASSNAME.iMap ? '' : obj.$class;
    realObj = obj.$;
  }

  if (!className) {
    return this._writeHashMap(realObj);
  }

  debug('writeObject with complex object, className: %s', className);
  return this._writeObject(obj);
};

proto.writeMap = proto.writeObject;

proto._writeListBegin = function (length, type) {
  this.byteBuffer.putChar('V');

  if (type) {
    this.writeType(type);
  }

  this.byteBuffer.put(0x6c); // 'l'
  this.byteBuffer.putInt(length);
  return true;
};

/**
 * encode array
 *
 * v1.0
 * ```
 * list ::= V(x56) [type(writeType)] l(0x6c) long-length(putInt) values 'z'
 * ```
 *
 * v2.0
 * ```
 * list ::= V(x56) type(writeType) n(0x6e) short-length(put) values 'z'
 *      ::= V(x56) type(writeType) l(0x6c) long-length(putInt) values 'z'
 *      ::= v(x76) ref(writeInt) fix-length(writeInt) values
 * ```
 *
 * An ordered list, like an array.
 * The two list productions are a fixed-length list and a variable length list.
 * Both lists have a type.
 * The type string may be an arbitrary UTF-8 string understood by the service.
 *
 * fixed length list:
 * Hessian 2.0 allows a compact form of the list for successive lists of
 * the same type where the length is known beforehand.
 * The type and length are encoded by integers,
 * where the type is a reference to an earlier specified type.
 *
 * @param {Array} arr
 * @return {this}
 */

proto.writeArray = function (arr) {
  if (this._checkRef(arr)) {
    // if is ref, will write by _checkRef
    return this;
  }

  var isSimpleArray = is.array(arr);
  var className = ''; // empty string meaning: `javaObject.DEFAULT_CLASSNAME.list`
  var realArray = arr;
  if (!isSimpleArray) {
    if (is.object(arr) && is.nullOrUndefined(arr.$)) {
      return this.writeNull();
    }
    var isComplexArray = is.object(arr) &&
      is.string(arr.$class) && is.array(arr.$);
    if (!isComplexArray) {
      throw new TypeError('hessian writeArray input type invalid');
    }

    debug('write array with a complex array with className: %s', className);

    className = arr.$class === javaObject.DEFAULT_CLASSNAME.list ? '' : arr.$class;
    realArray = arr.$;
  }

  var hasEnd = this._writeListBegin(realArray.length, className);

  for (var i = 0; i < realArray.length; i++) {
    this.write(realArray[i]);
  }

  if (hasEnd) {
    this.byteBuffer.putChar('z');
  }
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
  case 'string':
    return this.writeString(val);
  case 'boolean':
    return this.writeBool(val);
  case 'number':
    // must check long value first
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

  if (is.long(val) || is.Long(val)) {
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
    if (is.nullOrUndefined(val.$)) {
      return this.writeNull();
    }
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
