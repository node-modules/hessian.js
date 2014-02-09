/**!
 * hessian.js - index.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

var EncoderV1 = exports.EncoderV1 = exports.Encoder = require('./lib/v1/encoder');
var DecoderV1 = exports.DecoderV1 = exports.Decoder = require('./lib/v1/decoder');

var EncoderV2 = exports.EncoderV2 = require('./lib/v2/encoder');

exports.decode = DecoderV1.decode;
exports.encode = function encode(obj, version) {
  if (version === '2.0') {
    return new EncoderV2().write(obj).get();
  }
  return new EncoderV1().write(obj).get();
};

// java types
exports.java = require('./lib/java');
