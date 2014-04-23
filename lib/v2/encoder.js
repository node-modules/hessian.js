/**!
 * hessian.js - lib/v2/encoder.js
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

var debug = require('debug')('hessian:v2:encoder');
var is = require('is-type-of');
var util = require('util');
var EncoderV1 = require('../v1/encoder');
var javaObject = require('../object');

function Encoder() {
  EncoderV1.call(this);

  this._classRefs = [];
}

util.inherits(Encoder, EncoderV1);

var proto = Encoder.prototype;

/**
 * encode int
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
 *
 * code = value + 0x90
 * ```
 *
 * two octet integers:
 * Integers between -2048 and 2047 can be encoded in two octets with the leading byte in the range xc0 to xcf.
 * ```
 * value = ((code - 0xc8) << 8) + b0;
 *
 * b0 = value & 0xff
 * code = (value >> 8) + 0xc8
 * ```
 *
 * three octet integers:
 * Integers between -262144 and 262143 can be encoded in three bytes with the leading byte in the range xd0 to xd7.
 * ```
 * value = ((code - 0xd4) << 16) + (b1 << 8) + b0;
 *
 * b1b0 = value & 0xffff;
 * code = (value >> 16) + 0xd4
 * ```
 */
proto.writeInt = function (val) {
  if (val >= -16 && val <= 47) {
    this.byteBuffer.put(val + 0x90);
  } else if (val >= -2048 && val <= 2047) {
    var b0 = val & 0xff;
    var code = (val >> 8) + 0xc8;
    this.byteBuffer.put(code).put(b0);
  } else if (val >= -262144 && val <= 262143) {
    var b1b0 = val & 0xffff;
    var code = (val >> 16) + 0xd4;
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
 * v2.0
 * ```
 * long ::= L(x4c) b7 b6 b5 b4 b3 b2 b1 b0
 *      ::= [xd8-xef]
 *      ::= [xf0-xff] b0
 *      ::= [x38-x3f] b1 b0
 *      ::= x59 b3 b2 b1 b0
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
    this.byteBuffer.put(0x59).putInt32(val);
  } else {
    this.byteBuffer
      .put(0x4c)
      .putLong(val);
  }
  return this;
};

/**
 * encode double
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
 */
proto.writeDouble = function (val) {
  // TODO: double octet, short, float
  if (val === 0.0) {
    this.byteBuffer.put(0x5b);
  } else if (val === 1.0) {
    this.byteBuffer.put(0x5c);
  } else {
    this.byteBuffer
      .put(0x44)
      .putDouble(val);
  }
  return this;
};

/**
 * encode date
 *
 * * v2.0 Date Grammar
 * ```
 * date ::= x4a(J) b7 b6 b5 b4 b3 b2 b1 b0 // Date represented by a 64-bit long of milliseconds since Jan 1 1970 00:00H, UTC.
 *      ::= x4b(K) b4 b3 b2 b1 b0          // The second form contains a 32-bit int of minutes since Jan 1 1970 00:00H, UTC.
 * ```
 */
// proto.writeDate = function (milliEpoch) {
//   if (milliEpoch instanceof Date) {
//     milliEpoch = milliEpoch.getTime();
//   } else {
//     this._assertType('writeDate', 'number', milliEpoch);
//   }
//
//   this.byteBuffer
//     .put(0x4a)
//     .putLong(milliEpoch);
//   return this;
// };

/**
 * encode buffer
 *
 * v2.0
 * ```
 * binary ::= [x62(b), x41(A)] b1 b0 <binary-data> binary  # non-final chunk
 *        ::= x42(B) b1 b0 <binary-data>                   # final chunk
 *        ::= [x20-x2f] <binary-data>                      # binary data of length 0-15
 *        ::= [x34-x37] b0 <binary-data>                   # binary data of length 0-1023
 * ```
 * The octet x42 ('B') encodes the final chunk and
 * x41 ('A') represents any non-final chunk.
 * Each chunk has a 16-bit length value.
 *
 * len = 256 * b1 + b0 # max length 65535, unsigned int16
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
  while (left >= 65535) {
    this.byteBuffer
      .put(0x41)
      .putUInt16(65535)
      .put(buf.slice(offset, offset + 65535));

    offset += 65535;
    left = buf.length - offset;
  }

  if (left <= 15) {
    this.byteBuffer.put(left + 0x20).put(buf.slice(offset));
  } else {
    this.byteBuffer
      .put(0x42)
      .putUInt16(left)
      .put(buf.slice(offset));
  }
  return this;
};

// writeString java impl
/**
 * Writes a string value to the stream using UTF-8 encoding.
 * The string will be written with the following syntax:
 *
 * <code><pre>
 * S b16 b8 string-value
 * </pre></code>
 *
 * If the value is null, it will be written as
 *
 * <code><pre>
 * N
 * </pre></code>
 *
 * @param value the string value to write.
 */
// public void writeString(String value)
//   throws IOException {
//   int offset = _offset;
//   byte []buffer = _buffer;
//
//   if (SIZE <= offset + 16) {
//     flush();
//     offset = 0;
//   }
//
//   if (value == null) {
//     buffer[offset++] = (byte) 'N';
//
//     _offset = offset;
//   }
//   else {
//     int length = value.length();
//     int strOffset = 0;
//
//     while (length > 0x8000) {
//       int sublen = 0x8000;
//
//       offset = _offset;
//
//       if (SIZE <= offset + 16) {
//         flush();
//         offset = 0;
//       }
//
//       // chunk can't end in high surrogate
//       char tail = value.charAt(strOffset + sublen - 1);
//
//       if (0xd800 <= tail && tail <= 0xdbff)
//         sublen--;
//
//       buffer[offset + 0] = (byte) 's';
//             buffer[offset + 1] = (byte) (sublen >> 8);
//             buffer[offset + 2] = (byte) (sublen);
//
//       _offset = offset + 3;
//
//       printString(value, strOffset, sublen);
//
//       length -= sublen;
//       strOffset += sublen;
//     }
//
//     offset = _offset;
//
//     if (SIZE <= offset + 16) {
//       flush();
//       offset = 0;
//     }
//
//     if (length <= STRING_DIRECT_MAX) {
//       buffer[offset++] = (byte) (STRING_DIRECT + length);
//     }
//     else {
//       buffer[offset++] = (byte) ('S');
//       buffer[offset++] = (byte) (length >> 8);
//       buffer[offset++] = (byte) (length);
//     }
//
//     _offset = offset;
//
//     printString(value, strOffset, length);
//   }
// }

/**
 * encode string
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
      .put(0x53)
      .putUInt16(length)
      .putRawString(str.slice(strOffset));
  }
  return this;
};

/**
 * encode type
 *
 * * v2.0
 * ```
 * type ::= string
 *      ::= int
 * ```
 * Each type is added to the type map for future reference.
 *
 * type references:
 * Repeated type strings MAY use the type map to refer to a previously used type.
 * The type reference is zero-based over all the types encountered during parsing.
 */
proto.writeType = function (type) {
  type = type || '';
  this._assertType('writeType', 'string', type);
  this.writeString(type);
  // TODO: support int type
  return this;
};

/**
 * encode ref
 *
 * v2.0
 * ```
 * ref ::= Q(x51) int
 * ```
 *
 * Each map or list is stored into an array as it is parsed.
 * ref selects one of the stored objects. The first object is numbered '0'.
 */
proto.writeRef = function (value) {
  // this.byteBuffer.put(0x51);
  // this.writeInt(id);
  // return this;

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
    // _buffer[_offset++] = (byte) (REF_SHORT);
    // _buffer[_offset++] = (byte) (value >> 8);
    // _buffer[_offset++] = (byte) (value);
    var REF_SHORT = 0x4b; // 'K'
    this.byteBuffer.put(REF_SHORT);
    this.byteBuffer.putUInt16(value);
  } else {
    // _buffer[_offset++] = (byte) (0x52); // 'R'
    // _buffer[_offset++] = (byte) (value >> 24);
    // _buffer[_offset++] = (byte) (value >> 16);
    // _buffer[_offset++] = (byte) (value >> 8);
    // _buffer[_offset++] = (byte) (value);
    this.byteBuffer.put(0x52);
    this.byteBuffer.putInt(value);
  }
  return this;
};

/**
 * A sparse array
 *
 * @param {Object} obj simple obj
 * @return {this}
 */
proto._writeHashMap = function (obj) {
  debug('_writeHashMap() %j', obj);

  // Real code in java impl:
  // http://grepcode.com/file/repo1.maven.org/maven2/com.caucho/hessian/3.1.3/com/caucho/hessian/io/Hessian2Output.java#Hessian2Output.writeMapBegin%28java.lang.String%29
  // M type b16 b8 (<key> <value>)z
  // M (x4d)
  this.byteBuffer.put(0x4d);
  // hashmap's type is null

  // must sort keys
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

proto._writeObjectBegin = function (type) {
  debug('_writeObjectBegin() type: %s', type);
  var refV = this._classRefs.indexOf(type);
  if (refV >= 0) {
    // o(x6f) ref
    this.byteBuffer.put(0x6f);
    this.writeInt(refV);
    return refV;
  } else {
    // O(x4f) type
    this.byteBuffer.put(0x4f);
    this._classRefs.push(type);
    this.writeInt(type.length);
    this.byteBuffer.putRawString(type);
    return -1;
  }
};

/**
 * encode object and no type HashMap
 *   support circular
 *   support all kind of java object
 * : {a: 1}
 * : {$class: 'hessian.demo.Car', $: {a: 1}}
 *
 * v2.0
 * ```
 * map        ::= M(x4d) type (value value)* z
 * object     ::= O t b16 b8
 *            ::= o r
 * ```
 */
proto.writeObject = function (obj) {
  this._assertType('writeObject / writeMap', 'object', obj);
  if (this._checkRef(obj)) {
    // if is ref, will write by _checkRef
    return this;
  }

  if (!obj.$class || !obj.$) {
    // : {a: 1}
    return this._writeHashMap(obj);
  }

  // 'java.util.HashMap'
  if (obj.$class === javaObject.DEFAULT_CLASSNAME.map) {
    return this._writeHashMap(obj.$);
  }

  // java code:
  // int ref = out.writeObjectBegin(cl.getName());
  //
  // if (ref < -1) {
  //   writeObject10(obj, out);
  // }
  // else {
  //   if (ref == -1) {
  //     writeDefinition20(out);
  //     out.writeObjectBegin(cl.getName());
  //   }
  //
  //   writeInstance(obj, out);
  // }

  // class instance format:
  //
  // O(x4f) type fields-length(writeInt) fields-names(writeString) o ref fields-values(write)
  // o(x6f) ref(writeInt) fields-length(writeInt) fields-names(writeString) o ref fields-values(write)
  //
  // type format: length(writeInt) stringbytes(putRawString)

  var className = obj.$class;
  var realObj = obj.$;
  debug('writeObject with complex object, className: %s', className);
  var ref = this._writeObjectBegin(className);
  if (ref < -1) {
    // writeObject10
  } else {
    // field defined sort must same as java Class defined
    var keys = Object.keys(realObj);
    if (ref === -1) {
      // out.writeClassFieldLength(_fields.length);
      this.writeInt(keys.length);
      // write field names
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        this.writeString(key);
      }

      this._writeObjectBegin(className);

      // writeInstance
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        this.write(realObj[key]);
      }
    }
  }
  return this;
};

proto.writeMap = proto.writeObject;

proto._writeUnTypeFixedLengthArray = function (arr) {
  // ::= x58 int value*        # fixed-length untyped list
  var len = arr.length;
  this.byteBuffer.put(0x58);
  this.writeInt(len);
  for (var i = 0; i < arr.length; i++) {
    this.write(arr[i]);
  }
  return this;
};

/**
 * encode array
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
  var isSimpleArray = Array.isArray(arr);
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

  if (!className) {
    // untyped fixed-length list: list = {0, 1}
    this._writeUnTypeFixedLengthArray(realArray);
    return this;
  }

  // type fixed-length list
  // ::= 'V' type int value*   # fixed-length list
  this.byteBuffer.put(0x56);
  this.writeType(className);
  var len = realArray.length;
  this.writeInt(len);
  for (var i = 0; i < len; i++) {
    this.write(realArray[i]);
  }
  return this;
};

proto.writeList = proto.writeArray;

module.exports = Encoder;
