'use strict';

const MAX_INT_31 = Math.pow(2, 31);

exports.number = function(arg) {
  return typeof arg === 'number';
};

exports.int = function(obj) {
  return exports.number(obj) &&
    obj % 1 === 0;
};

exports.int32 = function(obj) {
  return exports.int(obj) &&
    obj < MAX_INT_31 &&
    obj >= -MAX_INT_31;
};

exports.string = function(arg) {
  return typeof arg === 'string';
};

exports.object = function(arg) {
  return typeof arg === 'object' && arg !== null;
};

exports.buffer = Buffer.isBuffer;
