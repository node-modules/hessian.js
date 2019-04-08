'use strict';

const debug = require('./debug')('hessian.js:utils');
const object = require('./object');

exports.MAX_INT_8 = Math.pow(2, 7);
exports.MAX_INT_16 = Math.pow(2, 15);
exports.MAX_INT_32 = Math.pow(2, 31);
exports.MAX_INT = Math.pow(2, 53);
const MAX_INT_HIGH = exports.MAX_INT_HIGH = Math.pow(2, 21);

exports.MAX_BYTE_TRUNK_SIZE = 0x8000;
exports.MAX_CHAR_TRUNK_SIZE = 0x8000;

exports.getSerializer = function(type) {
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

exports.isJavaObject = function(type) {
  return type === object.Object;
};

exports.handleLong = function(val) {
  const notSafeInt = val.high > MAX_INT_HIGH || // bigger than 2^54
    (val.high === MAX_INT_HIGH && val.low > 0) || // between 2^53 ~ 2^54
    val.high < -1 * MAX_INT_HIGH || // smaller than -2^54
    (val.high === -1 * MAX_INT_HIGH && val.low < 0); // between -2^54 ~ -2^53

  if (notSafeInt) {
    debug('[hessian.js Warning] Read a not safe long, translate it to string');
    return val.toString();
  }
  return val.toNumber();
};

const _hasOwnProperty = Object.prototype.hasOwnProperty;
/* jshint -W001 */
exports.hasOwnProperty = function hasOwnProperty(obj, property) {
  return _hasOwnProperty.call(obj, property);
};

exports.addByteCodes = function addByteCodes(map, codes, method) {
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    if (Array.isArray(code)) {
      const startCode = code[0];
      const endCode = code[1];
      for (let c = startCode; c <= endCode; c++) {
        map[c] = method;
      }
    } else {
      map[code] = method;
    }
  }
};

const MAX_SAFE_INTEGER_STR = '9007199254740991';
const MAX_SAFE_INTEGER_STR_LENGTH = 16; // '9007199254740991'.length

/**
 * Detect a number string can safe convert to Javascript Number.
 *
 * @param {String} s number format string, like `"123"`, `"-1000123123123123123123"`
 * @return {Boolean} *
 */
exports.isSafeNumberString = function isSafeNumberString(s) {
  if (s[0] === '-') {
    s = s.substring(1);
  }
  if (s.length < MAX_SAFE_INTEGER_STR_LENGTH ||
    (s.length === MAX_SAFE_INTEGER_STR_LENGTH && s <= MAX_SAFE_INTEGER_STR)) {
    return true;
  }
  return false;
};

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isLong(obj) {
  return obj && typeof obj.high === 'number' && typeof obj.low === 'number';
}
exports.isLong = isLong;


function objectToString(o) {
  return Object.prototype.toString.call(o);
}
