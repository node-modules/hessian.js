/**!
 * hessian.js - lib/utils.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

'use strict';

var debug = require('debug')('hessian.js:utils');
var object = require('./object');

var MAX_INT_8 = exports.MAX_INT_8 = Math.pow(2, 7);
var MAX_INT_16 = exports.MAX_INT_16 = Math.pow(2, 15);
var MAX_INT_32 = exports.MAX_INT_32 = Math.pow(2, 31);
var MAX_INT = exports.MAX_INT = Math.pow(2, 53);
var MAX_INT_HIGH = exports.MAX_INT_HIGH = Math.pow(2, 21);

var MAX_BYTE_TRUNK_SIZE = exports.MAX_BYTE_TRUNK_SIZE = 0x8000;
var MAX_CHAR_TRUNK_SIZE = exports.MAX_CHAR_TRUNK_SIZE = 0x8000;

var FLOAT_TEST_BUF = Buffer.allocUnsafe(4);

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
  var notSafeInt = val.high > MAX_INT_HIGH ||       // bigger than 2^54
    (val.high === MAX_INT_HIGH && val.low > 0) ||   // between 2^53 ~ 2^54
    val.high < -1 * MAX_INT_HIGH ||                 // smaller than -2^54
    (val.high === -1 * MAX_INT_HIGH && val.low < 0);// between -2^54 ~ -2^53

  if (notSafeInt) {
    debug('[hessian.js Warning] Read a not safe long, translate it to string');
    return val.toString();
  }
  return val.toNumber();
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

/**
 * float32 may has accuracy issue
 *
 * @example
 * ----------------
 * const buf = Buffer.allocUnsafe(4);
 * buf.writeFloatBE(19400447, 0);
 * buf.readFloatBE(0)  // here result is 19400448
 *
 * @param      {number}   input   The input
 * @return     {boolean}  { description_of_the_return_value }
 */
exports.float32Test = function float32Test(input) {
  FLOAT_TEST_BUF.writeFloatBE(input, 0);
  var output = FLOAT_TEST_BUF.readFloatBE(0);
  return output === input;
};
