/**
 * hessian.js - lib/utils.js
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

'use strict';

var debug = require('debug')('hessian.js:utils');
var Long = require('long');
var object = require('./object');

var MAX_SAFE_INT = Long.fromNumber(Math.pow(2, 53) - 1);
var MIN_SAFE_INT = Long.fromNumber(1 - Math.pow(2, 53));

var MAX_BYTE_TRUNK_SIZE = exports.MAX_BYTE_TRUNK_SIZE = 0x8000;
var MAX_CHAR_TRUNK_SIZE = exports.MAX_CHAR_TRUNK_SIZE = 0x8000;

// Map feature detect
exports.supportES6Map = typeof Map === 'function' && typeof Map.prototype.forEach === 'function';

exports.getSerializer = function (type) {
  // get from SERIALIZER_MAP
  if (object.SERIALIZER_MAP[type]) {
    return 'write' + object.SERIALIZER_MAP[type];
  }
  // array: [int
  if (type[0] === '[') {
    return 'writeArray';
  }
  // object
  return 'writeObject';
};

exports.isJavaObject = function (type) {
  return type === object.Object;
};

exports.handleLong = function (val) {
  if (val.greaterThan(MAX_SAFE_INT) || val.lessThan(MIN_SAFE_INT)) {
    val = val.toString();
    debug('[hessian.js Warning] Read a not safe long(%s), translate it to string', val);
    return val;
  }
  return val.toNumber();
};

exports.lengthOfUTF8 = function (head) {
  if (head < 0x80) {
    return 1;
  }
  if ((head & 0xe0) === 0xc0) {
    return 2;
  }

  if ((head & 0xf0) === 0xe0) {
    return 3;
  }
  throw new Error('string is not valid UTF-8 encode');
};

var _hasOwnProperty = Object.prototype.hasOwnProperty;
/* jshint -W001 */
exports.hasOwnProperty = function hasOwnProperty(obj, property) {
  return _hasOwnProperty.call(obj, property);
};

exports.addByteCodes = function addByteCodes(map, codes, method) {
  for (var i = 0; i < codes.length; i++) {
    var code = codes[i];
    if (Array.isArray(code)) {
      var startCode = code[0];
      var endCode = code[1];
      for (var c = startCode; c <= endCode; c++) {
        map[c] = method;
      }
    } else {
      map[code] = method;
    }
  }
};
