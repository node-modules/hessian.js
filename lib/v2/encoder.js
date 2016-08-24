/**
 * hessian.js - lib/v2/encoder.js
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

var debug = require('debug')('hessian:v2:encoder');
var is = require('is-type-of');
var util = require('util');
var EncoderV1 = require('../v1/encoder');
var javaObject = require('../object');
var utility = require('utility');
var supportES6Map = require('../utils').supportES6Map;

function Encoder(options) {
  EncoderV1.call(this, options);

  this._classRefs = [];
  this._typeRefs = [];
  this._classRefFields = {};
}

util.inherits(Encoder, EncoderV1);

var proto = Encoder.prototype;

/**
 * clean the buf
 */
proto.reset = proto.clean = function () {
  EncoderV1.prototype.clean.call(this);
  this._classRefs = [];
  this._typeRefs = [];
  return this;
};

var INT_DIRECT_MIN = -0x10; // -16
var INT_DIRECT_MAX = 0x2f;  // 47
var INT_ZERO = 0x90;        // 144

var INT_BYTE_MIN = -0x800;  // -2048
var INT_BYTE_MAX = 0x7ff;   // 2047
var INT_BYTE_ZERO = 0xc8;   // 200

var INT_SHORT_MIN = -0x40000; // -262144
var INT_SHORT_MAX = 0x3ffff;  // 262143
var INT_SHORT_ZERO = 0xd4;    // 212

/**
 * encode int
 *
 * v1.0
 * ```
 * int ::= I(x49) b3 b2 b1 b0
 * ```
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
 */
proto.writeInt = function (val) {
  this._assertType('writeInt', 'int32', val);
  if (INT_DIRECT_MIN <= val && val <= INT_DIRECT_MAX) {
    this.byteBuffer.put(val + INT_ZERO);
  } else if (INT_BYTE_MIN <= val && val <= INT_BYTE_MAX) {
    var b0 = val & 0xff;
    var code = (val >> 8) + INT_BYTE_ZERO;
    this.byteBuffer.put(code).put(b0);
  } else if (INT_SHORT_MIN <= val && val <= INT_SHORT_MAX) {
    var b1b0 = val & 0xffff;
    var code = (val >> 16) + INT_SHORT_ZERO;
    this.byteBuffer.put(code).putUInt16(b1b0);
  } else {
    this.byteBuffer
      .put(0x49)
      .putInt(val);
  }
  return this;
};

/**
 * encode long
 *
 * warning: we won't check if the long value is out of bound, be careful!
 *
 * v1.0
 * ```
 * long ::= L(x4c) b7 b6 b5 b4 b3 b2 b1 b0
 * ```
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
 */
proto.writeLong = function (val) {
  if (typeof val !== 'number' && utility.isSafeNumberString(val)) {
    val = Number(val);
  }

  if (val >= -8 && val <= 15) {
    this.byteBuffer.put(val + 0xe0);
  } else if (val >= -2048 && val <= 2047) {
    var b0 = val & 0xff;
    var code = (val >> 8) + 0xf8;
    this.byteBuffer.put(code).put(b0);
  } else if (val >= -262144 && val <= 262143) {
    var b1b0 = val & 0xffff;
    var code = (val >> 16) + 0x3c;
    this.byteBuffer.put(code).putUInt16(b1b0);
  } else if (val >= -0x80000000 && val <= 0x7fffffff) {
    // 32-bit integer cast to long
    this.byteBuffer.put(0x59).putInt32(val);
  } else {
    this.byteBuffer
      .put(0x4c) // 'L'
      .putLong(val);
  }
  return this;
};

/**
 * encode double
 *
 * v1.0
 * ```
 * double ::= D(x44) b7 b6 b5 b4 b3 b2 b1 b0
 * ```
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
 */
proto.writeDouble = function (val) {
  var intValue = parseInt(val);
  if (intValue === val) {
    if (val === 0) {
      this.byteBuffer.put(0x5b);
      return this;
    } else if (val === 1) {
      this.byteBuffer.put(0x5c);
      return this;
    } else if (-0x80 <= intValue && intValue < 0x80) {
      this.byteBuffer.put(0x5d).put(intValue);
      return this;
    } else if (-0x8000 <= intValue && intValue < 0x8000) {
      this.byteBuffer.put(0x5e).putInt16(intValue);
      return this;
    }
  }

  var mills = parseInt(val * 1000, 10);
  if (is.int32(mills) && mills * 0.001 === val) {
    // // 32-bit integer cast to double
    this.byteBuffer.put(0x5f).putInt32(mills);
    return this;
  }

  this.byteBuffer.put(0x44).putDouble(val);
  return this;
};

/**
 * Writes a date to the stream.
 *
 * date ::= x4a b7 b6 b5 b4 b3 b2 b1 b0
 *      ::= x4b b4 b3 b2 b1 b0
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##date
 *
 * @param time the date in milliseconds from the epoch in UTC
 */
proto.writeDate = function (milliEpoch) {
  if (milliEpoch instanceof Date) {
    milliEpoch = milliEpoch.getTime();
  }

  this._assertType('writeDate', 'number', milliEpoch);

  if ((milliEpoch % 60000) === 0) {
    // compact date
    var minutes = milliEpoch / 60000;
    if (minutes >= -0x80000000 && minutes <= 0x7fffffff) {
      this.byteBuffer
        .put(0x4b)
        .putInt32(minutes);
      return this;
    }
  }

  this.byteBuffer
    .putChar(0x4a)
    .putLong(milliEpoch);
  return this;
};

/**
 * encode buffer
 *
 * v1.0
 * ```
 * binary ::= [x62(b)] b1 b0 <binary-data> binary  # non-final chunk
 *        ::= x42(B) b1 b0 <binary-data>           # final chunk
 * ```
 *
 * v2.0
 * ```
 * binary ::= x41(A) b1 b0 <binary-data> binary    # non-final chunk
 *        ::= x42(B) b1 b0 <binary-data>           # final chunk
 *        ::= [x20-x2f] <binary-data>              # binary data of length 0-15
 *        ::= [x34-x37] b0 <binary-data>           # binary data of length 0-1023
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##binary
 * ```
 * The octet x42 ('B') encodes the final chunk and
 * x62 ('b') represents any non-final chunk.
 * Each chunk has a 16-bit length value.
 *
 * len = 256 * b1 + b0 # max length 32768(0x8000)
 *
 * Binary data with length less than 15 may be encoded by a single octet length [x20-x2f].
 *
 * len = code - 0x20
 */
proto.writeBytes = function (buf) {
  this._assertType('writeBytes', 'buffer', buf);
  if (buf.length <= 15) {
    this.byteBuffer.put(buf.length + 0x20).put(buf);
    return this;
  }

  var offset = 0;
  var left = buf.length - offset;
  while (left > 4093) {
    this.byteBuffer
      .put(0x41) // 'A'
      .putUInt16(4093)
      .put(buf.slice(offset, offset + 4093));

    offset += 4093;
    left = buf.length - offset;
  }

  if (left <= 15) {
    this.byteBuffer
      .put(left + 0x20)
      .put(buf.slice(offset));
  } else if (left <= 1023) {
    this.byteBuffer
      .put((left >> 8) + 0x34)
      .put(left)
      .put(buf.slice(offset));
  } else {
    this.byteBuffer
      .put(0x42) // 'B'
      .putUInt16(left)
      .put(buf.slice(offset));
  }
  return this;
};

/**
 * encode string
 *
 * v1.0
 * ```
 * string ::= s(x73) b1 b0 <utf8-data> string  # non-final chunk
 *        ::= S(x53) b1 b0 <utf8-data>         # string of length 0-65535
 * ```
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
 * The length is the number of 16-bit (0x8000) characters, which may be different than the number of bytes.
 * String chunks may not split surrogate pairs.
 *
 * short strings:
 * Strings with length less than 32 may be encoded with a single octet length [x00-x1f].
 * ```
 * [x00-x1f] <utf8-data>
 * ```
 */
proto.writeString = function (str) {
  this._assertType('writeString', 'string', str);

  var length = str.length;
  var strOffset = 0;
  var sublen;
  while (length > 0x8000) {
    sublen = 0x8000;
    // chunk can't end in high surrogate
    var tail = str.charCodeAt(strOffset + sublen - 1);
    if (0xd800 <= tail && tail <= 0xdbff) {
      debug('writeString got tail: 0x%s', tail.toString(16));
      sublen--;
    }

    this.byteBuffer
      .put(0x52)
      .putUInt16(sublen)
      .putRawString(str.slice(strOffset, strOffset + sublen));

    length -= sublen;
    strOffset += sublen;
    debug('writeString strOffset: %s, length: %s, sublen: %s', strOffset, length, sublen);
  }

  debug('writeString left length: %s', length);
  if (length <= 31) {
    // short strings
    this.byteBuffer.put(length);
  } else if (length <= 1023) {
    this.byteBuffer
      .put(48 + (length >> 8))
      .put(length);
  } else {
    this.byteBuffer
      .putChar('S')
      .put(length >> 8)
      .put(length);
  }

  this.byteBuffer.putRawString(str.slice(strOffset));
  return this;
};

var _typecache = {};

/**
 * encode type
 *
 * v1.0
 * ```
 * type ::= 0x74(t) type-string-length(putUInt16) type-string(putRawString)
 * ```
 *
 * v2.0
 * ```
 * type ::= type-string(putRawString)
 *      ::= type-ref(writeInt)
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##type
 * ```
 *
 * A map or list includes a type attribute indicating the type name of the map or
 * list for object-oriented languages.
 *
 * Each type is added to the type map for future reference.
 *
 * type references:
 * Repeated type strings MAY use the type map to refer to a previously used type.
 * The type reference is zero-based over all the types encountered during parsing.
 */
proto.writeType = function (type) {
  type = type || '';
  if (!type) {
    return;
  }

  var ref = this._typeRefs.indexOf(type);
  if (ref >= 0) {
    this.writeInt(ref);
  } else {
    this._typeRefs.push(type);
    if (_typecache[type]) {
      this.byteBuffer.put(_typecache[type]);
    } else {
      var start = this.byteBuffer.position();
      this.writeString(type);
      var end = this.byteBuffer.position();
      _typecache[type] = this.byteBuffer.copy(start, end);
    }
  }
  return this;
};

/**
 * encode ref
 *
 * v1.0
 * ```
 * ref ::= R(0x52) int(putInt)
 * ```
 *
 * v2.0
 * ```
 * ref ::= (0x51) int(putInt)
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##ref
 * ```
 *
 * Each map or list is stored into an array as it is parsed.
 * ref selects one of the stored objects. The first object is numbered '0'.
 */
proto.writeRef = function (value) {
  this.byteBuffer.put(0x51);
  this.writeInt(value);
  return this;
};

var _classcache = {};

/**
 *
 * v2.0
 * ```
 * class-def  ::= 'C' string int string*
 * object     ::= 'O' int value*
 *            ::= [x60-x6f] value*
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##object
 * ```
 */
proto._writeObjectBegin = function (type, fields) {
  debug('_writeObjectBegin() type: %s', type);
  var ref = this._classRefs.indexOf(type);
  if (ref >= 0) {
    if (ref <= 15) {
      this.byteBuffer.put(0x60 + ref);
    } else {
      // O(x4f) type-string-length(writeInt) type-string(putRawString)
      this.byteBuffer.putChar('O');
      this.writeInt(ref);
    }
    return ref;
  } else {
    // class definition
    this.byteBuffer.putChar('C');
    this._classRefs.push(type);
    this._classRefFields[type] = fields;
    if (_classcache[type]) {
      this.byteBuffer.put(_classcache[type]);
    } else {
      var start = this.byteBuffer.position();
      this.writeString(type);
      var end = this.byteBuffer.position();
      _classcache[type] = this.byteBuffer.copy(start, end);
    }
    return -1;
  }
};

// class definition:
//
// The object definition includes a mandatory type string, the number of fields,
// and the field names. The object definition is stored in the object definition
// map and will be referenced by object instances with an integer reference.
//
// object instantiation:
//
// The object instantiation creates a new object based on a previous definition.
// The integer value refers to the object definition.
//
// type format: length(writeInt) stringbytes(putRawString)
proto._writeObject = function (obj) {
  var className = obj.$class;
  var realObj = obj.$;
  // hessian 2.0
  // field defined sort must same as java Class defined
  var keys = Object.keys(realObj);
  var ref = this._writeObjectBegin(className, keys);
  if (ref === -1) {
    // writeDefinition20
    // out.writeClassFieldLength(_fields.length);
    this.writeInt(keys.length);
    // write field names
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      this.writeString(key);
    }
    this._writeObjectBegin(className);
  }
  keys = this._classRefFields[className];
  // writeInstance
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    this.write(realObj[key]);
  }

  return this;
};

/**
 * A sparse array
 *
 * ```
 * untyped map    ::= 'H' (value value)* 'Z'
 *
 * @see http://hessian.caucho.com/doc/hessian-serialization.html##map
 * ```
 *
 * @param {Object} obj simple obj
 * @return {this}
 */
proto._writeHashMap = function (obj) {
  debug('_writeHashMap() %j, fields: %j', obj);

  this.byteBuffer.put(0x48); // H

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
  this.byteBuffer.putChar('Z');
  return this;
};

// Writes the list header to the stream.
//
// list ::= x55 type value* 'Z'   # variable-length list
//      ::= 'V' type int value*   # fixed-length list
//      ::= x57 value* 'Z'        # variable-length untyped list
//      ::= x58 int value*        # fixed-length untyped list
//      ::= [x70-77] type value*  # fixed-length typed list
//      ::= [x78-7f] value*       # fixed-length untyped list
//
// @see http://hessian.caucho.com/doc/hessian-serialization.html##list
proto._writeListBegin = function (length, type) {
  if (length < 0) {
    if (!type) {
      this.byteBuffer.put(0x57);
    } else {
      this.byteBuffer.put(0x55);
      this.writeType(type);
    }
    return true;
  } else if (length <= 7) {
    if (!type) {
      this.byteBuffer.put(120 + length);
    } else {
      this.byteBuffer.put(112 + length);
      this.writeType(type);
    }
    return false;
  } else {
    if (!type) {
      this.byteBuffer.put(0x58);
    } else {
      this.byteBuffer.put(0x56);
      this.writeType(type);
    }
    this.writeInt(length);
    return false;
  }
};

module.exports = Encoder;
