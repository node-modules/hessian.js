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

function Decoder(buf, hessianVersion) {
  this.byteBuffer = new ByteBuffer({
    array: buf
  });
  this.refMap = {};
  this.classes = [];
  this.types = [];
  this.refId = 0;
  hessianVersion = hessianVersion || '1.0';
  this.isV2 = hessianVersion >= '2.0';
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
  this.types = [];
  this.classes = [];
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
 * v2.0
 * ```
 * int ::= I(x49) b3 b2 b1 b0
 *     ::= [x80-xbf]
 *     ::= [xc0-xcf] b0
 *     ::= [xd0-xd7] b1 b0
 * ```
 *
 * A 32-bit signed integer. An integer is represented by the octet x49 ('I')
 * followed by the 4 octets of the integer in big-endian order.
 * ```
 * value = (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
 * ```
 *
 * single octet integers:
 * Integers between -16 and 47 can be encoded by a single octet in the range x80 to xbf.
 * ```
 * value = code - 0x90
 * ```
 *
 * two octet integers:
 * Integers between -2048 and 2047 can be encoded in two octets with the leading byte in the range xc0 to xcf.
 * ```
 * value = ((code - 0xc8) << 8) + b0;
 * ```
 *
 * three octet integers:
 * Integers between -262144 and 262143 can be encoded in three bytes with the leading byte in the range xd0 to xd7.
 * ```
 * value = ((code - 0xd4) << 16) + (b1 << 8) + b0;
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
 * v2.0
 * ```
 * long ::= L(x4c) b7 b6 b5 b4 b3 b2 b1 b0
 *      ::= [xd8-xef]
 *      ::= [xf0-xff] b0
 *      ::= [x38-x3f] b1 b0
 *      ::= x4c b3 b2 b1 b0
 * ```
 * A 64-bit signed integer. An long is represented by the octet x4c ('L' )
 * followed by the 8-bytes of the integer in big-endian order.
 *
 * single octet longs:
 * Longs between -8 and 15 are represented by a single octet in the range xd8 to xef.
 * ```
 * value = (code - 0xe0)
 * ```
 *
 * two octet longs:
 * Longs between -2048 and 2047 are encoded in two octets with the leading byte in the range xf0 to xff.
 * ```
 * value = ((code - 0xf8) << 8) + b0
 * ```
 *
 * three octet longs:
 * Longs between -262144 and 262143 are encoded in three octets with the leading byte in the range x38 to x3f.
 * ```
 * value = ((code - 0x3c) << 16) + (b1 << 8) + b0
 * ```
 *
 * four octet longs:
 * Longs between which fit into 32-bits are encoded in five octets with the leading byte x59.
 * ```
 * value = (b3 << 24) + (b2 << 16) + (b1 << 8) + b0
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
 * v2.0
 * ```
 * double ::= D(x44) b7 b6 b5 b4 b3 b2 b1 b0
 *        ::= x5b
 *        ::= x5c
 *        ::= x5d b0
 *        ::= x5e b1 b0
 *        ::= x5f b3 b2 b1 b0
 * ```
 * The double 0.0 can be represented by the octet x5b
 * The double 1.0 can be represented by the octet x5c
 *
 * double octet:
 * Doubles between -128.0 and 127.0 with no fractional component
 * can be represented in two octets by casting the byte value to a double.
 * ```
 * value = (double) b0
 * ```
 *
 * double short:
 * Doubles between -32768.0 and 32767.0 with no fractional component
 * can be represented in three octets by casting the short value to a double.
 * ```
 * value = (double) (256 * b1 + b0)
 * ```
 *
 * double float:
 * Doubles which are equivalent to their 32-bit float representation
 * can be represented as the 4-octet float and then cast to double.
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
 * v2.0 Date Grammar
 * ```
 * date ::= x4a(J) b7 b6 b5 b4 b3 b2 b1 b0 // Date represented by a 64-bit long of milliseconds since Jan 1 1970 00:00H, UTC.
 *      ::= x4b(K) b4 b3 b2 b1 b0          // The second form contains a 32-bit int of minutes since Jan 1 1970 00:00H, UTC.
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
 * x4b(K) b4 b3 b2 b1 b0
 * Date represented by a 32-bit int of minutes since Jan 1 1970 00:00H, UTC.
 *
 * @return {Date}
 * @api public
 */
proto.readDateInMinutes = function () {
  this._checkLabel('readDateInMinutes', 'K');
  var date = this.byteBuffer.getUInt32() * 60000;
  debug('read a date with milliEpoch: %d', date);
  return new Date(date);
};

/**
 * read bytes from buffer
 *
 * v1.0
 * ```
 * binary ::= (b b16 b8 binary-data)* B b16 b8 binary-data
 * // Binary data is encoded in chunks.
 * // 'B' represents the final chunk and
 * // 'b' represents any initial chunk. Each chunk has a 16-bit length value.
 * ```
 *
 * v2.0
 * ```
 * binary ::= x62(b) b1 b0 <binary-data> binary
 *        ::= x42(B) b1 b0 <binary-data>
 *        ::= [x20-x2f] <binary-data>
 * ```
 * The octet x42 ('B') encodes the final chunk and
 * x62 ('b') represents any non-final chunk.
 * Each chunk has a 16-bit length value.
 *
 * len = 256 * b1 + b0
 *
 * Binary data with length less than 15 may be encoded by a single octet length [x20-x2f].
 *
 * len = code - 0x20
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
 * v2.0
 * ```
 * string ::= R(x52) b1 b0 <utf8-data> string  # non-final chunk
 *        ::= S(x53) b1 b0 <utf8-data>         # string of length 0-65535
 *        ::= [x00-x1f] <utf8-data>            # string of length 0-31
 *        ::= [x30-x33] b0 <utf8-data>         # string of length 0-1023
 * ```
 * A 16-bit unicode character string encoded in UTF-8. Strings are encoded in chunks.
 * x53 ('S') represents the final chunk and x52 ('R') represents any non-final chunk.
 * Each chunk has a 16-bit unsigned integer length value.
 *
 * The length is the number of 16-bit characters, which may be different than the number of bytes.
 * String chunks may not split surrogate pairs.
 *
 * short strings:
 * Strings with length less than 32 may be encoded with a single octet length [x00-x1f].
 * ```
 * [x00-x1f] <utf8-data>
 * ```
 *
 * @return {String}
 * @api public
 */
proto.readString = function () {
  var str = '';
  var code = this.byteBuffer.get();
  // get all trunk start with 's'
  //
  // hession 2.0:
  // x52 ('R') represents any non-final chunk
  while (code === 0x52 || code === 0x73) {
    str += this._readUTF8String();
    code = this.byteBuffer.get();
  }

  if (code >= 0x00 && code <= 0x1f) {
    // short strings
    debug('read short strings');
    str += this._readUTF8String(code);
  } else if (code === 0x53) {
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

/**
 * v2.0
 * ```
 * type ::= string
 *      ::= int
 * ```
 * Each type is added to the type map for future reference.
 *
 * type references:
 * Repeated type strings MAY use the type map to refer to a previously used type.
 * The type reference is zero-based over all the types encountered during parsing.
 *
 * @return {String} type string
 */
proto.readTypeV2 = function () {
  var type = this.read();
  if (typeof type === 'string') {
    debug('got type#%d: %s', this.types.length, type);
    this.types.push(type);
  } else {
    // type references
    type = this.types[type];
  }
  return type;
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
 * Read an object from buffer
 *
 * v2.0
 * ```
 * class-def  ::= 'C(x43)' string int string*
 *
 * object     ::= 'O(x4f)' int value*
 *            ::= [x60-x6f] value*
 * ```
 *
 * class definition:
 * Hessian 2.0 has a compact object form where the field names are only serialized once.
 * Following objects only need to serialize their values.
 *
 * The object definition includes a mandatory type string,
 * the number of fields, and the field names.
 * The object definition is stored in the object definition map
 * and will be referenced by object instances with an integer reference.
 *
 * object instantiation:
 * Hessian 2.0 has a compact object form where the field names are only serialized once.
 * Following objects only need to serialize their values.
 *
 * The object instantiation creates a new object based on a previous definition.
 * The integer value refers to the object definition.
 *
 * @param {Boolean} withType if need retain the type info
 * @return {Object}
 * @api public
 */
proto.readObjectV2 = function (withType) {
  // class definition
  var code = this.byteBuffer.get();
  // C char
  if (code === 0x43) {
    var className = this.read();
    var fieldCount = this.read();
    var fields = [];
    for (var i = 0; i < fieldCount; i++) {
      fields.push(this.read());
    }
    var cls = {
      name: className,
      fields: fields
    };
    debug('got class#%d: %j', this.classes.length, cls);

    this.classes.push(cls);

    code = this.byteBuffer.get();
  }

  // objects
  // O or [0x60 - 0x6f]
  if (code === 0x4f || (code >= 0x60 && code <= 0x6f)) {
    var classIndex;
    if (code === 0x4f) {
      classIndex = this.read();
    } else {
      classIndex = code - 0x60;
    }
    var cls = this.classes[classIndex];
    debug('class ref#%d: %j', classIndex, cls);
    var result = {
      $class: cls.name,
      $: {}
    };
    // must set ref first, because object will refers to itself
    this._addRef(result);
    for (var i = 0; i < cls.fields.length; i++) {
      var field = cls.fields[i];
      result.$[field] = this.read(withType);
    }

    return withType ? result : result.$;
  } else {
    throw new TypeError('hessian readObjectV2 error, unexpect start code: 0x' + code.toString(16));
  }
};

proto._readMap = function (map, withType) {
  var code = this.byteBuffer.get(this.byteBuffer.position());
  map = map || {};
  var k;
  var v;
  // Z
  while (code !== 0x5a) {
    k = this.read(withType);
    v = this.read(withType);
    map[k] = v;
    code = this.byteBuffer.get(this.byteBuffer.position());
  }

  // got Z, move forward 1 byte
  this.byteBuffer.skip(1);
  return map;
};

/**
 * A sparse array, untyped map (HashMap for Java)
 * hessian 2.0
 * @see http://hessian.caucho.com/doc/hessian-serialization.html#anchor27
 * @return {Object}
 */
proto.readHashMap = function (withType) {
  this._checkLabel('readHashMap', 'H');
  var result = {};
  this._addRef(result);
  this._readMap(result, withType);
  return result;
};

/**
 * read an object from buffer
 *
 * v1.0
 * ```
 * map ::= M t b16 b8 type-string (object, object)* z
 * ```
 *
 * v2.0
 * ```
 * map        ::= M type (value value)* Z
 * ```
 * Represents serialized maps and can represent objects.
 * The type element describes the type of the map.
 * The type may be empty, i.e. a zero length.
 * The parser is responsible for choosing a type if one is not specified.
 * For objects, unrecognized keys will be ignored.
 *
 * Each map is added to the reference list. Any time the parser expects a map,
 * it must also be able to support a null or a ref.
 *
 * The type is chosen by the service.
 *
 * @param {Boolean} withType if need retain the type info
 * @return {Object}
 * @api public
 */
proto.readMap = function (withType) {
  if (!this.isV2) {
    return this.readObject();
  }

  // hessian v2.0
  this._checkLabel('readMap', 'M');
  var type = this.readTypeV2();
  var result = {
    $class: type,
    $: {}
  };

  // obj maybe refers to itself
  this._addRef(result);
  this._readMap(result.$, withType);
  return withType ? result : result.$;
};

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
 * v2.0
 * ```
 * list ::= x55 type value* 'Z'   # variable-length list
 *      ::= 'V(x56)' type int value*   # fixed-length list
 *      ::= x57 value* 'Z'        # variable-length untyped list
 *      ::= x58 int value*        # fixed-length untyped list
 *      ::= [x70-77] type value*  # fixed-length typed list
 *      ::= [x78-7f] value*       # fixed-length untyped list
 * ```
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
 * @param {Boolean} withType if need retain the type info
 * @return {Array}
 * @api public
 */
proto.readArray = function (withType) {
  debug('start read an array');
  if (this.isV2) {
    return this.readArrayV2(withType);
  }

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

proto._readVariableLengthItems = function (list, withType) {
  var code = this.byteBuffer.get(this.byteBuffer.position());
  // Z
  while (code !== 0x5a) {
    list.push(this.read(withType));
    code = this.byteBuffer.get(this.byteBuffer.position());
  }

  // got Z, move forward 1 byte
  this.byteBuffer.skip(1);
};

proto._readFixedLengthItems = function (len, list, withType) {
  for (var i = 0; i < len; i++) {
    list.push(this.read(withType));
  }
};

proto.readArrayV2 = function (withType) {
  var code = this.byteBuffer.get();
  var type;
  var list = [];
  if (code === 0x55) {
    // x55 type value* 'Z'   # variable-length list
    type = this.readTypeV2();
    list = {
      $class: type,
      $: list
    };
    this._addRef(list);
    this._readVariableLengthItems(list.$, withType);
  } else if (code === 0x56) {
    // 'V' type int value*   # fixed-length list
    type = this.readTypeV2();
    list = {
      $class: type,
      $: list
    };
    this._addRef(list);
    this._readFixedLengthItems(this.read(), list.$, withType);
  } else if (code === 0x57) {
    // x57 value* 'Z'        # variable-length untyped list
    this._addRef(list);
    this._readVariableLengthItems(list, withType);
  } else if (code === 0x58) {
    // x58 int value*        # fixed-length untyped list
    this._addRef(list);
    this._readFixedLengthItems(this.read(), list, withType);
  } else if (code >= 0x70 && code <= 0x77) {
    // [x70-77] type value*  # fixed-length typed list
    var len = code - 0x70;
    type = this.readTypeV2();
    list = {
      $class: type,
      $: list
    };
    this._addRef(list);
    this._readFixedLengthItems(len, list.$, withType);
  } else if (code >= 0x78 && code <= 0x7f) {
    // [x78-7f] value*       # fixed-length untyped list
    var len = code - 0x78;
    this._addRef(list);
    this._readFixedLengthItems(len, list, withType);
  } else {
    throw new TypeError('hessian readArrayV2 error, unexpect start code: 0x' + code.toString(16));
  }

  if (!withType && list.$) {
    list = list.$;
  }
  return list;
};

proto.readList = proto.readArray;

/**
 * v1.0
 * ```
 * ref ::= R(x52) b32 b24 b16 b8
 * ```
 *
 * v2.0
 * ```
 * ref ::= Q(x51) int
 * ```
 *
 * Each map or list is stored into an array as it is parsed.
 * ref selects one of the stored objects. The first object is numbered '0'.
 *
 * @return {Object}
 */
proto.readRef = function (withType) {
  var refId;
  if (this.isV2) {
    this._checkLabel('readRef', 'Q');
    refId = this.read();
  } else {
    this._checkLabel('readRef', 'R');
    refId = this.byteBuffer.getInt();
  }
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
  case 'd': // hessian 1.0
  case 'J': // hessian 2.0 ::= x4a(J) b7 b6 b5 b4 b3 b2 b1 b0
    this.byteBuffer.position(offset);
    return this.readDate();
  case 'K': // hessian 2.0 ::= x4b(K) b3 b2 b1 b0
    this.byteBuffer.position(offset);
    return this.readDateInMinutes();
  case 'S': // utf-8 string final chunk ('S')
    this.byteBuffer.position(offset);
    return this.readString();
  case 's':
    this.byteBuffer.position(offset);
    // x70 - x77    # fixed list with direct length (p, q, r, s, t, u, v, w)
    if (this.isV2) {
      return this.readArrayV2(withType);
    }

    // x73, hessian 1.0, meaning string non-final chunk
    return this.readString();
  case 'B':
  case 'b':
    this.byteBuffer.position(offset);
    return this.readBytes();
  case 'C':
  case 'O':
    this.byteBuffer.position(offset);
    return this.readObjectV2(withType);
  case 'M':
    this.byteBuffer.position(offset);
    if (this.isV2) {
      return this.readMap(withType);
    }
    return this.readObject(withType);
  case 'H':
    this.byteBuffer.position(offset);
    return this.readHashMap(withType);
  case 'V':
    this.byteBuffer.position(offset);
    return this.readArray(withType);
  case 'R':
    this.byteBuffer.position(offset);
    // R meaning ref on hessian 1.0
    // but hessian 2.0 meaning not final string: ::= x52(R) b1 b0 <utf8-data> string
    if (this.isV2) {
      return this.readString();
    }
    return this.readRef(withType);
  case 'Q': // hessian 2.0, ref
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
