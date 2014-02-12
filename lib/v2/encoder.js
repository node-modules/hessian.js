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

var util = require('util');
var EncoderV1 = require('../v1/encoder');

function Encoder() {
  EncoderV1.call(this);
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
proto.writeDate = function (milliEpoch) {
  if (milliEpoch instanceof Date) {
    milliEpoch = milliEpoch.getTime();
  } else {
    this._assertType('writeDate', 'number', milliEpoch);
  }

  this.byteBuffer
    .put(0x4a)
    .putLong(milliEpoch);
  return this;
};

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

/**
 * encode string
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
 */
proto.writeString = function (str) {
  this._assertType('writeString', 'string', str);
  if (str.length <= 31) {
    this.byteBuffer.put(str.length).putRawString(str);
    return this;
  }

  var offset = 0;
  while (str.length - offset >= 65535) {
    this.byteBuffer
      .put(0x52)
      .putUInt16(65535)
      .putRawString(str.slice(offset, offset + 65535));

    offset += 65535;
  }

  var left = str.length - offset;
  if (left <= 31) {
    this.byteBuffer.put(str.length).putRawString(str.slice(offset));
  } else {
    this.byteBuffer
      .put(0x53)
      .putUInt16(left)
      .putRawString(str.slice(offset));
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
proto.writeRef = function (id) {
  this.byteBuffer
    .put(0x51)
    .putInt(id);
  return this;
};

module.exports = Encoder;
