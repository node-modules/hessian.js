/**
 * hessian.js - lib/v2/decoder.js
 *
 * Copyright(c)
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
var debug = require('debug')('hessian:v2:decoder');
var DecoderV1 = require('../v1/decoder');
var utils = require('../utils');
var JavaExceptionError = require('../object').JavaExceptionError;
var supportES6Map = require('../utils').supportES6Map;

var BYTE_CODES = {};

function Decoder(buf) {
  DecoderV1.call(this, buf);
  this.BYTE_CODES = BYTE_CODES;
  this.classes = []; // {name: classname, fields: []}
  this.types = [];

  this._isLastChunk = false;
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
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##int
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
 *      ::= x4c b3 b2 b1 b0
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##long
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
  var code = this.byteBuffer.get();
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
  if (code === 0x59) {
    // 32-bit integer cast to long
    return this.byteBuffer.getInt32();
  }
  if (code === 0x4c) {
    return utils.handleLong(this.byteBuffer.getLong());
  }

  this.throwError('readLong', code);
};

utils.addByteCodes(BYTE_CODES, [
  [0xd8, 0xef],
  [0xf0, 0xff],
  [0x38, 0x3f],
  0x59,
  0x4c
], 'readLong');

/**
 * read a double from buffer
 *
 * v2.0
 * ```
 * double ::= D(x44) b7 b6 b5 b4 b3 b2 b1 b0
 *        ::= x5b
 *        ::= x5c
 *        ::= x5d(byte) b0
 *        ::= x5e(short) b1 b0
 *        ::= x5f(float) b3 b2 b1 b0
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##double
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
 * Doubles between -32768.0 (-0x8000) and 32767.0(0x8000 - 1) with no fractional component
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
  var code = this.byteBuffer.get();
  if (code === 0x44) {
    return this.byteBuffer.getDouble();
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
    return this.byteBuffer.getInt32() * 0.001;
  }
  this.throwError('readDouble', code);
};

utils.addByteCodes(BYTE_CODES, [
  0x44,
  0x5b,
  0x5c,
  0x5d,
  0x5e,
  0x5f
], 'readDouble');

/**
 * read a date from buffer,
 *
 * v2.0
 * ```
 * date ::= x4a(J) b7 b6 b5 b4 b3 b2 b1 b0 // Date represented by a 64-bit long of milliseconds since Jan 1 1970 00:00H, UTC.
 *      ::= x4b(K) b4 b3 b2 b1 b0          // The second form contains a 32-bit int of minutes since Jan 1 1970 00:00H, UTC.
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##date
 * ```
 *
 * @return {Date}
 * @api public
 */
proto.readDate = function () {
  var code = this.byteBuffer.get();
  if (code === 0x4a) {
    return new Date(utils.handleLong(this.byteBuffer.getLong()));
  }
  if (code === 0x4b) {
    return new Date(this.byteBuffer.getInt32() * 60000);
  }

  this.throwError('readDate', code);
};

utils.addByteCodes(BYTE_CODES, [
  0x4a,
  0x4b,
], 'readDate');

/**
 * read bytes from buffer
 *
 * v2.0
 * ```
 * binary ::= x41(A) b1 b0 <binary-data> binary
 *        ::= x42(B) b1 b0 <binary-data>
 *        ::= [x20-x2f] <binary-data>
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##binary
 * ```
 * The octet x42 ('B') encodes the final chunk and
 * x41 ('A') represents any non-final chunk.
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
  // get non-final trunk start with 'A'
  while (code === 0x41) {
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
  } else if (code >= 0x34 && code <= 0x37) {
    length = (code - 0x34) * 256 + this.byteBuffer.get();
    bufs.push(this.byteBuffer.read(length));
  } else {
    this.throwError('readBytes', code);
  }

  return Buffer.concat(bufs);
};

utils.addByteCodes(BYTE_CODES, [
  0x41,
  0x42,
  [0x34, 0x37],
  [0x20, 0x2f],
], 'readBytes');

/**
 * read a string from buffer
 *
 * The length is the number of characters, which may be different than the number of bytes.
 *
 * v2.0
 * ```
 * string ::= R(x52) b1 b0 <utf8-data> string  # non-final chunk
 *        ::= S(x53) b1 b0 <utf8-data>         # string of length 0-65535
 *        ::= [x00-x1f] <utf8-data>            # string of length 0-31
 *        ::= [x30-x33] b0 <utf8-data>         # string of length 0-1023
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##string
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
  debug('readString() code: %s', code);

  var length;
  switch(code) {
    // 0-byte string
    case 0x00: case 0x01: case 0x02: case 0x03:
    case 0x04: case 0x05: case 0x06: case 0x07:
    case 0x08: case 0x09: case 0x0a: case 0x0b:
    case 0x0c: case 0x0d: case 0x0e: case 0x0f:

    case 0x10: case 0x11: case 0x12: case 0x13:
    case 0x14: case 0x15: case 0x16: case 0x17:
    case 0x18: case 0x19: case 0x1a: case 0x1b:
    case 0x1c: case 0x1d: case 0x1e: case 0x1f:
      this._isLastChunk = true;
      length = code - 0x00;
      debug('read short strings');
      str += this._readUTF8String(length);
      break;

    case 0x30: case 0x31: case 0x32: case 0x33:
      this._isLastChunk = true;
      length = (code - 0x30) * 256 + this.byteBuffer.get();
      str += this._readUTF8String(length);
      break;

    case 0x53:
      this._isLastChunk = true;
      // x53 ('S') represents the final chunk
      debug('read last trunk of string');
      str += this._readUTF8String();
      break;

    case 0x52:
      this._isLastChunk = false;
      // x52 ('R') represents any non-final chunk.
      str += this._readUTF8String();

      while (!this._isLastChunk) {
        str += this.readString();
      }
      break;

    default:
      this.throwError('readString', code);
      break;
  }
  return str;
};

utils.addByteCodes(BYTE_CODES, [
  0x52,
  0x53,
  [0x00, 0x1f],
  [0x30, 0x33],
], 'readString');

/**
 * @return {String} type string
 *
 * v2.0
 * ```
 * ref ::= (0x51) int(putInt)
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##ref
 * ```
 */
proto.readType = function () {
  var pos = this.byteBuffer.position();
  var code = this.byteBuffer.get(pos);

  var type = '';
  switch (code) {
    case 0x00: case 0x01: case 0x02: case 0x03:
    case 0x04: case 0x05: case 0x06: case 0x07:
    case 0x08: case 0x09: case 0x0a: case 0x0b:
    case 0x0c: case 0x0d: case 0x0e: case 0x0f:

    case 0x10: case 0x11: case 0x12: case 0x13:
    case 0x14: case 0x15: case 0x16: case 0x17:
    case 0x18: case 0x19: case 0x1a: case 0x1b:
    case 0x1c: case 0x1d: case 0x1e: case 0x1f:

    case 0x30: case 0x31: case 0x32: case 0x33:
    case 0x52: case 0x53:
      type = this.readString();
      this.types.push(type);
      debug('got type#%d: %s', this.types.length, type);
      break;

    default:
      var ref = this.readInt();
      type = this.types[ref];
      debug('got ref:%d type#%d: %s', ref, this.types.length, type);
      break;
  }
  return type;
};

proto._readObjectDefinition = function () {
  var classname = this.readString();
  var fieldsLength = this.readInt();
  var fields = [];
  for (var i = 0; i < fieldsLength; i++) {
    fields.push(this.readString());
  }

  debug('_readObjectDefinition got %s fields: %j', classname, fields);
  this.classes.push({
    name: classname,
    fields: fields
  });
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
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##object
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
  var code = this.byteBuffer.get();
  var ref;
  if (code === 0x43) {
    // C(x43) type fields-length(writeInt) fields-names(writeString) o ref fields-values(write)
    this._readObjectDefinition();
    return this.readObject(withType);
  } else if (code === 0x4f) {
    ref = this.readInt();
  } else if (code >= 0x60 && code <= 0x6f) {
    ref = code - 0x60;
  } else {
    this.throwError('readObject', code);
  }
  
  var cls = this.classes[ref];
  debug('readObject %s, ref: %s', cls.name, ref);

  var result = {
    $class: cls.name,
    $: {}
  };
  this._addRef(result);

  var fields = cls.fields;
  for (var i = 0; i < fields.length; i++) {
    var name = fields[i];
    var value = this.read(withType);
    if (!/^this\$\d+$/.test(name)) {
      result.$[name] = value;
    }
  }

  if (/Exception$/.test(cls.name)) {
    result.$ = new JavaExceptionError(result, withType);
  }

  return withType ? result : result.$;
};

utils.addByteCodes(BYTE_CODES, [
  0x43,
  0x4f,
  [0x60, 0x6f],
], 'readObject');

/**
 * v2.0
 * ```
 * ref ::= Q(x51) int
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##ref
 * ```
 *
 * Each map or list is stored into an array as it is parsed.
 * ref selects one of the stored objects. The first object is numbered '0'.
 *
 * @return {Number}
 */
proto.readRefId = function (withType) {
  var code = this.byteBuffer.get();
  if (code === 0x51) {
    return this.readInt();
  }

  this.throwError('readRef', code);
};

utils.addByteCodes(BYTE_CODES, [
  0x51,
], 'readRef');

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
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##list
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
  var code = this.byteBuffer.get();
  var type;
  var result;
  var list = [];
  var length = null;

  if (code === 0x56) {
    type = this.readType();
    length = this.readInt();
  } else if (code === 0x58) {
    length = this.readInt();
  } else if (code >= 0x78 && code <= 0x7f) {
    length = code - 0x78;
  } else if (code >= 0x70 && code <= 0x77) {
    type = this.readType();
    length = code - 0x70;
  }

  debug('readArray() type: %s, code: %s', type, code);

  if (type) {
    result = {
      $class: type,
      $: list
    };
  } else {
    result = list;
  }

  this._addRef(result);
  this._readFixedLengthItems(length, list, withType);

  if (!withType) {
    return list;
  }

  return result;
};

utils.addByteCodes(BYTE_CODES, [
  0x56,
  0x58,
  [0x70, 0x77],
  [0x78, 0x7f],
], 'readArray');

proto._readMap = function (map, withType) {
  var code = this.byteBuffer.get(this.byteBuffer.position());
  map = map || {};

  if (supportES6Map) {
    Object.defineProperty(map, '$map', {
      value: new Map(),
      enumerable: false,
    });
  }

  var k;
  var v;
  // Z(0x5a) list/map terminator
  while (code !== 0x5a) {
    k = this.read(withType);
    v = this.read(withType);
    
    map[k] = v;
    if (supportES6Map) {
      map.$map.set(k, v);
    }

    code = this.byteBuffer.get(this.byteBuffer.position());
  }

  // got [Z], move forward 1 byte
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
 * 
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##map
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
    this._readMap(map);
    return map;
  }

  var result = {
    $class: type,
    $: {}
  };

  // obj maybe refers to itself
  this._addRef(result);
  this._readMap(result.$, withType);

  if (/Exception$/.test(type)) {
    result.$ = new JavaExceptionError(result);
  }

  return withType ? result : result.$;
};

utils.addByteCodes(BYTE_CODES, [
  0x4d
], 'readMap');

module.exports = Decoder;
