/**!
 * hessian.js - lib/v2/decoder.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var util = require('util');
var is = require('is-type-of');
var debug = require('debug')('hessian:v2:decoder');
var DecoderV1 = require('../v1/decoder');
var utils = require('../utils');
var isJavaException = require('../object').isJavaException;
var JavaExceptionError = require('../object').JavaExceptionError;
var decodeFnCtx = { JavaExceptionError: JavaExceptionError };
var codegen = require('@protobufjs/codegen');

var BYTE_CODES = {};
var errorProps = {
  detailMessage: true,
  stackTrace: true,
};

function Decoder(buf, classCache) {
  DecoderV1.call(this, buf);
  this.BYTE_CODES = BYTE_CODES;
  this.classes = []; // {name: classname, fields: []}
  this.types = [];
  this.classCache = classCache;
}

util.inherits(Decoder, DecoderV1);

var proto = Decoder.prototype;

proto.clean = function () {
  DecoderV1.prototype.clean.call(this);
  this.types = [];
  this.classes = [];
  return this;
};

// readBool()
utils.addByteCodes(BYTE_CODES, [
  0x46,
  0x54,
], 'readBool');

// readNull()
utils.addByteCodes(BYTE_CODES, [
  0x4e,
], 'readNull');

/**
 * read a int from buffer
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
  var code = this.byteBuffer.get();
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
  if (code === 0x49) {
    return this.byteBuffer.getInt();
  }

  this.throwError('readInt', code);
};

utils.addByteCodes(BYTE_CODES, [
  [0x80, 0xbf],
  [0xc0, 0xcf],
  [0xd0, 0xd7],
  0x49
], 'readInt');

/**
 * read a long from buffer
 *
 * v2.0
 * ```
 * long ::= L(x4c) b7 b6 b5 b4 b3 b2 b1 b0
 *      ::= [xd8-xef]
 *      ::= [xf0-xff] b0
 *      ::= [x38-x3f] b1 b0
 *      ::= x77 b3 b2 b1 b0
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
proto.readLong = function (withType) {
  var result;
  var code = this.byteBuffer.get();
  // Compact long
  if (code >= 0xd8 && code <= 0xef) {
    // Longs between -8 and 15 are represented by a single octet in the range xd8 to xef.
    // value = (code - 0xe0)
    result = code - 0xe0;
  } else if (code >= 0xf0 && code <= 0xff) {
    // Longs between -2048 and 2047 are encoded in two octets with the leading byte in the range xf0 to xff.
    // value = ((code - 0xf8) << 8) + b0
    result = ((code - 0xf8) << 8) + this.byteBuffer.get();
  } else if (code >= 0x38 && code <= 0x3f) {
    // Longs between -262144 and 262143 are encoded in three octets with the leading byte in the range x38 to x3f.
    // value = ((code - 0x3c) << 16) + (b1 << 8) + b0
    var b1 = this.byteBuffer.get();
    var b0 = this.byteBuffer.get();
    result = ((code - 0x3c) << 16) + (b1 << 8) + b0;
  // ::= x77 b3 b2 b1 b0       # 32-bit integer cast to long
  } else if (code === 0x77) {
    // Longs between which fit into 32-bits are encoded in five octets with the leading byte x59.
    // value = (b3 << 24) + (b2 << 16) + (b1 << 8) + b0
    result = this.byteBuffer.getInt32();
  } else if (code === 0x4c) {
    result = utils.handleLong(this.byteBuffer.getLong());
  } else {
    this.throwError('readLong', code);
  }

  return this.handleType('long', result, withType);
};

utils.addByteCodes(BYTE_CODES, [
  [0xd8, 0xef],
  [0xf0, 0xff],
  [0x38, 0x3f],
  0x77,
  0x4c
], 'readLong');

/**
 * read a double from buffer
 *
 * format @see EncoderV2.prototype.writeDouble
 *
 * @return {Number}
 * @api public
 */
proto.readDouble = function (withType) {
  var result;
  var code = this.byteBuffer.get();
  if (code === 0x44) {
    result = this.byteBuffer.getDouble();
  // Compact double
  } else if (code === 0x67) {
    result = 0.0;
  } else if (code === 0x68) {
    result = 1.0;
  } else if (code === 0x69) {
    result = this.byteBuffer.getInt8();
  } else if (code === 0x6a) {
    result = this.byteBuffer.getInt16();
  } else if (code === 0x6b) {
    result = this.byteBuffer.getFloat();
  } else {
    this.throwError('readDouble', code);
  }

  return this.handleType('double', result, withType);
};

utils.addByteCodes(BYTE_CODES, [
  0x44,
  0x67,
  0x68,
  0x69,
  0x6a,
  0x6b
], 'readDouble');

/**
 * read a date from buffer,
 *
 * v2.0
 * ```
 * date ::= x4a(J) b7 b6 b5 b4 b3 b2 b1 b0 // Date represented by a 64-bit long of milliseconds since Jan 1 1970 00:00H, UTC.
 *      ::= x4b(K) b4 b3 b2 b1 b0          // The second form contains a 32-bit int of minutes since Jan 1 1970 00:00H, UTC.
 * ```
 *
 * @return {Date}
 * @api public
 */
// proto.readDate = function () {
//   var code = this.byteBuffer.get();
//   if (code === 0x4a) {
//     return new Date(utils.handleLong(this.byteBuffer.getLong()));
//   }
//   if (code === 0x4b) {
//     return new Date(this.byteBuffer.getUInt32() * 60000);
//   }
//
//   this.throwError('readDate', code);
// };
//
// utils.addByteCodes(BYTE_CODES, [
//   // 0x4a,
//   // 0x4b,
// ], 'readDate');
utils.addByteCodes(BYTE_CODES, [
  0x64
], 'readDate');

/**
 * read bytes from buffer
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
  var code = this.byteBuffer.get();
  if (code >= 0x20 && code <= 0x2f) {
    // short binary
    var len = code - 0x20;
    return this.byteBuffer.read(len);
  }

  var bufs = [];
  var length = 0;
  // get non-final trunk start with 'b'
  while (code === 0x62) {
    length = this.byteBuffer.getUInt16();
    bufs.push(this.byteBuffer.read(length));
    code = this.byteBuffer.get();
  }

  if (code === 0x42) {
    // get the last trunk start with 'B'
    length = this.byteBuffer.getUInt16();
    bufs.push(this.byteBuffer.read(length));
  } else if (code >= 0x20 && code <= 0x2f) {
    length = code - 0x20;
    bufs.push(this.byteBuffer.read(length));
  } else {
    this.throwError('readBytes', code);
  }

  return Buffer.concat(bufs);
};

utils.addByteCodes(BYTE_CODES, [
  0x62,
  0x42,
  [0x20, 0x2f],
], 'readBytes');

/**
 * read a string from buffer
 *
 * The length is the number of characters, which may be different than the number of bytes.
 *
 * v2.0
 * ```
 * string ::= s(x73) b1 b0 <utf8-data> string  # non-final chunk
 *        ::= S(x53) b1 b0 <utf8-data>         # string of length 0-65535
 *        ::= [x00-x1f] <utf8-data>            # string of length 0-31
 *        ::= [x30-x33] b0 <utf8-data>         # string of length 0-1023
 * ```
 * A 16-bit unicode character string encoded in UTF-8. Strings are encoded in chunks.
 * x53 ('S') represents the final chunk and x73 ('s') represents any non-final chunk.
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
  debug('readString() code: %s', code);
  // x73 ('s') represents any non-final chunk
  while (code === 0x73) {
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
    this.throwError('readString', code);
  }

  return str;
};

utils.addByteCodes(BYTE_CODES, [
  0x73,
  0x53,
  [0x00, 0x1f],
  // [0x30, 0x33],
], 'readString');

/**
 * @return {String} type string
 */
proto.readType = function () {
  // http://grepcode.com/file/repo1.maven.org/maven2/com.caucho/hessian/3.1.3/com/caucho/hessian/io/Hessian2Input.java#Hessian2Input.readType%28%29
  // Parses a type from the stream.
  // t b16 b8
  var pos = this.byteBuffer.position();
  var code = this.byteBuffer.get();

  var type;
  switch (code) {
  case 0x74: // 't' String
    // t(x74) len(putUInt16) type-string(putRawString)
    var len = this.byteBuffer.getUInt16();
    type = this.byteBuffer.readRawString(len);
    debug('got type#%d: %s', this.types.length, type);
    this.types.push(type);
    return type;
  case 0x54: // 'T' Ref
  case 0x75: // 'u' TYPE_REF = 0x75
    // u(x75) ref(writeInt)
    var ref = this.readInt();
    type = this.types[ref];
    debug('got ref:%d type#%d: %s', ref, this.types.length, type);
    return type;
  default:
    // reset the position
    this.byteBuffer.position(pos);
    return "";
  }
};

// properties match with this$\d+ means inner properties
// it is useless for node and is circular structure
var INNER_CLASS_PROPERTY_REG = /^this\$\d+$/;
var INNER_CLASS_LABEL = '$$ignore_inner_property$$';

proto._readObjectDefinition = function () {
  var size = this.readInt();
  var classname = this._readUTF8String(size);
  var fieldsLength = this.readInt();
  // compose cache key with class name and fields length
  // more safely
  var cachekey = classname + '##' + fieldsLength;

  // get class definition from cache
  var cacheClz = this.classCache && this.classCache.get(cachekey);
  if (cacheClz) {
    this.byteBuffer.skip(cacheClz.length);
    this.classes.push(cacheClz);
    return cacheClz;
  }

  var pos = this.byteBuffer.position();
  var fields = [];
  for (var i = 0; i < fieldsLength; i++) {
    var name = this.readString();
    if (INNER_CLASS_PROPERTY_REG.test(name)) {
      name = INNER_CLASS_LABEL;
    }
    fields.push(name);
  }
  debug('_readObjectDefinition got %s fields: %j', classname, fields);
  var clz = {
    name: classname,
    fields: fields,
    length: this.byteBuffer.position() - pos,
    decodeFn: null,
  };

  this.classes.push(clz);
  // set class definition into cache
  if (this.classCache) {
    if (this.classCache.enableCompile) {
      var errorPropCount = 0;
      var gen = codegen(['decoder', 'withType'], 'decode');
      gen('// %s', cachekey);
      gen('var result = {');
      gen('  $class: \'%s\',', classname);
      gen('  $: {');
      for (var field of fields) {
        if (errorProps[field]) {
          errorPropCount++;
        }
        if (INNER_CLASS_LABEL === field) {
          continue;
        }
        gen('    %s: null,', field);
      }
      gen('  },');
      gen('};');
      gen('decoder._addRef(result);');
      for (var field of fields) {
        if (INNER_CLASS_LABEL === field) {
          gen('decoder.read(false);');
        } else {
          gen('result.$.%s = decoder.read(withType);', field);
        }
      }
      if (errorPropCount === 2) {
        gen('result.$ = new JavaExceptionError(result, withType);');
      }
      gen('return withType ? result : result.$');
      clz.decodeFn = gen(decodeFnCtx);
    }
    this.classCache.set(cachekey, clz);
  }
  return clz;
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
proto.readObject = function (withType) {
  // class instance format:
  //
  // O(x4f) type fields-length(writeInt) fields-names(writeString) o ref fields-values(write)
  // o(x6f) ref(writeInt) fields-length(writeInt) fields-names(writeString) o ref fields-values(write)
  //
  // type format: length(writeInt) stringbytes(putRawString)

  var code = this.byteBuffer.get();
  var ref;
  if (code === 0x4f) {
    this._readObjectDefinition();
    return this.readObject(withType);
  } else if (code === 0x6f) {
    ref = this.readInt();
  } else {
    this.throwError('readObject', code);
  }

  // must be code: 'o'
  var cls = this.classes[ref];
  debug('readObject %s, ref: %s', cls.name, ref);
  if (cls.decodeFn) {
    return cls.decodeFn(this, withType);
  }
  var result = {
    $class: cls.name,
    $: {}
  };
  this._addRef(result);

  var fields = cls.fields;
  for (var i = 0; i < fields.length; i++) {
    var name = fields[i];
    if (INNER_CLASS_LABEL === name) {
      this.read(false);
      continue;
    }
    var value = this.read(withType);
    result.$[name] = value;
  }

  if (isJavaException(result.$)) {
    result.$ = new JavaExceptionError(result, withType);
  }

  return withType ? result : result.$;
};

utils.addByteCodes(BYTE_CODES, [
  // 0x43,
  0x4f,
  0x6f,
  // [0x60, 0x6f],
], 'readObject');

/**
 * v2.0
 * ```
 * ref ::= Q(x51) int
 * ```
 *
 * Each map or list is stored into an array as it is parsed.
 * ref selects one of the stored objects. The first object is numbered '0'.
 *
 * @return {Number}
 */
proto.readRefId = function (withType) {
  var code = this.byteBuffer.get();
  // if (code === 0x51) {
  //   return this.read();
  // }
  if (code === 0x4a) {
    return this.byteBuffer.get();
  }

  if (code === 0x4b) {
    return this.byteBuffer.getUInt16();
  }

  if (code === 0x52) {
    return this.byteBuffer.getInt();
  }

  this.throwError('readRef', code);
};

utils.addByteCodes(BYTE_CODES, [
  0x4a,
  0x4b,
  0x52,
], 'readRef');

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

/**
 * read an array from buffer
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
  // format:
  //
  // V(x56) type(writeType) 0x6e short-length(put) values 'z'
  // V(x56) type(writeType) 'l(0x6c)' long-length(putInt) values 'z'
  // v(x76) ref(writeInt) fix-length(writeInt) values
  var code = this.byteBuffer.get();
  var type;
  var result;
  var list = [];
  var hasEnd;
  var length = null;
  if (code === 0x56) {
    type = this.readType();
    hasEnd = true;
  } else {
    var ref = this.readInt();
    type = this.types[ref];
    hasEnd = false;
    length = this.readInt();
  }

  debug('readArray() type: %s, code: %s', type, code);

  this._addRef(list);

  if (type) {
    result = {
      $class: type,
      $: list
    };
  } else {
    result = list;
  }

  if (length === null) {
    code = this.byteBuffer.get();
    length = 0;
    if (code === 0x6e) {
      length = this.byteBuffer.get();
    } else if (code === 0x6c) {
      length = this.byteBuffer.getInt();
    }
  }

  for (var i = 0; i < length; i++) {
    list.push(this.read(withType));
  }

  if (hasEnd) {
    this.byteBuffer.skip(1);
  }

  if (!withType) {
    return list;
  }

  return result;
};

utils.addByteCodes(BYTE_CODES, [
  0x76,
  0x56,
  // 0x55,
  // 0x56,
  // 0x57,
  // 0x58,
  // // 0x73 is repeat String 's' tag
  // // [0x70, 0x77],
  // [0x78, 0x7f],
], 'readArray');

proto._readMap = function (map, withType) {
  var code = this.byteBuffer.get(this.byteBuffer.position());
  map = map || {};
  var k;
  var v;
  // z(x7a)
  while (code !== 0x7a) {
    k = this.read(withType);
    v = this.read(withType);
    var key = is.object(k) && k.name ? k.name : k;
    map[key] = v;
    code = this.byteBuffer.get(this.byteBuffer.position());
  }

  // got [z], move forward 1 byte
  this.byteBuffer.skip(1);
  return map;
};

/**
 * A sparse array, untyped map (HashMap for Java)
 * hessian 2.0
 * @see http://hessian.caucho.com/doc/hessian-serialization.html#anchor27
 *
 * @return {Object}
 */
proto.readHashMap = function (withType) {
  // H: x48
  var code = this.byteBuffer.get();
  if (code !== 0x48) {
    this.throwError('readHashMap', code);
  }

  var result = {};
  this._addRef(result);
  this._readMap(result, withType);
  return result;
};

utils.addByteCodes(BYTE_CODES, [
  0x48
], 'readHashMap');

/**
 * read an map from buffer
 *
 * v2.0
 * ```
 * map        ::= M(x4d) [type] (value value)* Z
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
  var code = this.byteBuffer.get();
  if (code !== 0x4d) {
    this.throwError('readMap', code);
  }

  var type = this.readType();
  debug('readMap() got type: %j, withType: %s', type, withType);
  if (!type) {
    var map = {};
    this._addRef(map);
    this._readMap(map, withType);
    return map;
  }

  var result = {
    $class: type,
    $: {}
  };

  // obj maybe refers to itself
  this._addRef(result);
  this._readMap(result.$, withType);

  if (isJavaException(result.$)) {
    result.$ = new JavaExceptionError(result);
  }

  return withType ? result : result.$;
};

utils.addByteCodes(BYTE_CODES, [
  0x4d
], 'readMap');

module.exports = Decoder;
