'use strict';

var debug = require('debug')('hessian:v2:encoder');
var is = require('is-type-of');
var util = require('util');
var EncoderV1 = require('../v1/encoder');
var javaObject = require('../object');
var utility = require('utility');
var Long = require('long');
var float32Test = require('../utils').float32Test;

var SUPPORT_ES6_MAP = typeof Map === 'function' && typeof Map.prototype.forEach === 'function';

function Encoder(options) {
  EncoderV1.call(this, options);

  this._classRefs = [];
  this._classRefFields = {};
  this._typeRefs = [];
}

util.inherits(Encoder, EncoderV1);

var proto = Encoder.prototype;

/**
 * clean the buf
 */
proto.reset = proto.clean = function () {
  EncoderV1.prototype.clean.call(this);
  this._classRefs = [];
  this._classRefFields = {};
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
 */
proto.writeLong = function (val) {
  if (typeof val === 'string') {
    if (!utility.isSafeNumberString(val)) {
      val = Long.fromString(val);
    } else {
      val = Number(val);
    }
  } else if (Long.isLong(val) && (val.high === 0 || val.high === -1)) {
    val = val.toNumber();
  }

  if (typeof val === 'number') {
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
    } else if (val >= -2147483648 && val <= 2147483647) {
      this.byteBuffer.put(0x77).putInt32(val);
    } else {
      this.byteBuffer
        .put(0x4c) // 'L'
        .putLong(val);
    }
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
 *        ::= x67
 *        ::= x68
 *        ::= x69(byte) b0
 *        ::= x6a(short) b1 b0
 *        ::= x6b(float) b3 b2 b1 b0
 * ```
 * The double 0.0 can be represented by the octet x67
 * The double 1.0 can be represented by the octet x68
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
      this.byteBuffer.put(0x67);
      return this;
    } else if (val === 1) {
      this.byteBuffer.put(0x68);
      return this;
    } else if (-0x80 <= intValue && intValue < 0x80) {
      this.byteBuffer.put(0x69).put(intValue);
      return this;
    } else if (-0x8000 <= intValue && intValue < 0x8000) {
      this.byteBuffer.put(0x6a).putInt16(intValue);
      return this;
    } else if (-0x80000000 <= intValue && intValue < 0x80000000 && float32Test(intValue)) {
      // 0x80000000L <= 0x7fffffffL
      this.byteBuffer.put(0x6b).putFloat(intValue);
      return this;
    }
  }

  // var floatValue = parseFloat(val);
  // if (floatValue === val) {
  //   this.byteBuffer.put(0x6b).putFloat(floatValue);
  //   return this;
  // }

  this.byteBuffer.put(0x44).putDouble(val);
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
 * binary ::= [x62(b)] b1 b0 <binary-data> binary  # non-final chunk
 *        ::= x42(B) b1 b0 <binary-data>           # final chunk
 *        ::= [x20-x2f] <binary-data>              # binary data of length 0-15
 *        ::= [x34-x37] b0 <binary-data>           # binary data of length 0-1023
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
  // TODO: [x34-x37] b0 <binary-data>
  this._assertType('writeBytes', 'buffer', buf);
  if (buf.length <= 15) {
    this.byteBuffer.put(buf.length + 0x20).put(buf);
    return this;
  }

  var offset = 0;
  var left = buf.length - offset;
  while (left > 0x8000) { // 32768
    this.byteBuffer
      .put(0x62) // 'b'
      .putUInt16(0x8000)
      .put(buf.slice(offset, offset + 0x8000));

    offset += 0x8000;
    left = buf.length - offset;
  }

  if (left <= 15) {
    this.byteBuffer.put(left + 0x20).put(buf.slice(offset));
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
 * string ::= s(x73) b1 b0 <utf8-data> string  # non-final chunk
 *        ::= S(x53) b1 b0 <utf8-data>         # string of length 0-65535
 *        ::= [x00-x1f] <utf8-data>            # string of length 0-31
 *        ::= [x30-x33] b0 <utf8-data>         # string of length 0-1023
 * ```
 * A 16-bit unicode character string encoded in UTF-8. Strings are encoded in chunks.
 * x53 ('S') represents the final chunk and x73 ('s') represents any non-final chunk.
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
  if (str.length <= 31) {
    this.byteBuffer.put(str.length).putRawString(str);
    return this;
  }

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
  if (length <= 31) {
    this.byteBuffer.put(length).putRawString(str.slice(strOffset));
  } else {
    this.byteBuffer
      .put(0x53) // 'S'
      .putUInt16(length)
      .putRawString(str.slice(strOffset));
  }
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
 * type ::= 0x74(t) type-string-length(putUInt16) type-string(putRawString)
 *      ::= 0x75(u) ref(writeInt)
 * ```
 * Each type is added to the type map for future reference.
 *
 * type references:
 * Repeated type strings MAY use the type map to refer to a previously used type.
 * The type reference is zero-based over all the types encountered during parsing.
 */
proto.writeType = function (type) {
  // type format:
  // t(x74) len(putUInt16) type-string(putRawString)
  // u(x75) ref(writeInt)
  type = type || '';
  if (!type) {
    return;
  }

  var ref = this._typeRefs.indexOf(type);
  if (ref >= 0) {
    var TYPE_REF = 0x75; // 'u'
    this.writeInt(ref);
  } else {
    this._typeRefs.push(type);
    if (_typecache[type]) {
      this.byteBuffer.put(_typecache[type]);
    } else {
      var start = this.byteBuffer.position();
      this.byteBuffer.put(0x74); // 't'
      this.byteBuffer.putUInt16(type.length);
      this.byteBuffer.putRawString(type);
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
 * ref ::= R(0x52) int(putInt)
 *     ::= J(0x4a) byte(put)
 *     ::= K(0x4b) short(putUInt16)
 * ```
 *
 * Each map or list is stored into an array as it is parsed.
 * ref selects one of the stored objects. The first object is numbered '0'.
 */
proto.writeRef = function (value) {
  // java code:
  // R b32 b24 b16 b8
  // public static final int REF_BYTE = 0x4a;
  // public static final int REF_SHORT = 0x4b;
  //
  // public static final int TYPE_REF = 0x75; // 'u'

  if (value < 0x100) {
    var REF_BYTE = 0x4a; // 'J'
    this.byteBuffer.put(REF_BYTE);
    this.byteBuffer.put(value);
  } else if (value < 0x10000) {
    var REF_SHORT = 0x4b; // 'K'
    this.byteBuffer.put(REF_SHORT);
    this.byteBuffer.putUInt16(value);
  } else {
    this.byteBuffer.put(0x52); // 'R'
    this.byteBuffer.putInt(value);
  }
  return this;
};

var _classcache = {};

proto._writeObjectBegin = function (type, fields) {
  debug('_writeObjectBegin() type: %s, fields: %j', type, fields);
  var ref = this._classRefs.indexOf(type);
  if (ref >= 0) {
    // o(x6f) ref
    this.byteBuffer.put(0x6f);
    this.writeInt(ref);
    return ref;
  } else {
    // O(x4f) type-string-length(writeInt) type-string(putRawString)
    this._classRefs.push(type);
    this._classRefFields[type] = fields;
    if (_classcache[type]) {
      this.byteBuffer.put(_classcache[type]);
    } else {
      var start = this.byteBuffer.position();
      this.byteBuffer.put(0x4f);
      this.writeInt(type.length);
      this.byteBuffer.putRawString(type);
      var end = this.byteBuffer.position();
      _classcache[type] = this.byteBuffer.copy(start, end);
    }

    return -1;
  }
};

// class instance format:
//
// O(x4f) type fields-length(writeInt) fields-names(writeString) o ref fields-values(write)
// o(x6f) ref(writeInt) fields-length(writeInt) fields-names(writeString) o ref fields-values(write)
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
    this._writeObjectBegin(className, keys);
  }

  // writeInstance
  keys = this._classRefFields[className];
  debug('_writeObject %s, fields: %j', className, keys);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    this.write(realObj[key]);
  }

  return this;
};

// Writes the list header to the stream.
//
// format:
// V(x56) type(writeType) n(0x6e) short-length(put) values 'z'
// V(x56) type(writeType) l(0x6c) long-length(putInt) values 'z'
//
// fix lengthed format:
// v(x76) ref(writeInt) fix-length(writeInt) values
proto._writeListBegin = function (length, type) {
  var ref = this._typeRefs.indexOf(type);
  if (ref >= 0) {
    this.byteBuffer.put(0x76); // 'v'
    this.writeInt(ref);
    this.writeInt(length);
    return false;
  }

  this.byteBuffer.put(0x56); // 'V';
  this.writeType(type);

  if (length < 0x100) {
    this.byteBuffer.put(0x6e); // 'n'
    this.byteBuffer.put(length);
  } else {
    this.byteBuffer.put(0x6c); // 'l'
    this.byteBuffer.putInt(length);
  }
  return true;
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
proto._writeHashMap = function (obj, className) {
  debug('_writeHashMap() %j, fields: %j', obj);

  this.byteBuffer.put(0x4d); // M

  if (className) {
    this.byteBuffer.put(0x74);
    this.byteBuffer.putUInt16(className.length);
    this.byteBuffer.putRawString(className);
  }

  if (SUPPORT_ES6_MAP && obj instanceof Map) {
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

module.exports = Encoder;
