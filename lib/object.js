/**!
 * hessian.js - lib/object.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

exports.DEFAULT_CLASSNAME = {
  boolean: 'boolean',
  int: 'int',
  long: 'long',
  double: 'double',
  date: 'java.util.Date',
  string: 'java.lang.String',
  byteArray: '[B',
  list: 'java.util.ArrayList',
  map: 'java.util.HashMap',
  exception: 'java.lang.RuntimeException'
};

var SERIALIZER_MAP = exports.SERIALIZER_MAP = {};

['boolean', 'java.lang.Boolean'].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Bool';
});

['double', 'java.lang.Double',
  'float', 'java.lang.Float'
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Double';
});

['java.lang.Long', 'long'].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Long';
});

['short', 'java.lang.Short', 'int',
  'java.lang.Integer', 'byte', 'java.lang.Byte'
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Int';
});

['java.lang.String', 'char',
  'char[]', 'java.lang.Character'
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'String';
});

['java.util.ArrayList', 'java.util.List', 'java.util.Set', 'java.util.Iterator',
  'java.util.Enumeration'
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Array';
});

exports.getSerializer = function (type) {
  if (typeof type === 'string') {
    // get from SERIALIZER_MAP
    if (SERIALIZER_MAP[type]) {
      return 'write' + SERIALIZER_MAP[type];
    }
    // array
    if (type[0] === '[') {
      return 'writeArray';
    }
    // object
    return 'writeObject';
  }
};
