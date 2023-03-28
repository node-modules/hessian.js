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

'use strict';

var EncoderV1 = exports.EncoderV1 = exports.Encoder = require('./lib/v1/encoder');
var DecoderV1 = exports.DecoderV1 = exports.Decoder = require('./lib/v1/decoder');

var EncoderV2 = exports.EncoderV2 = require('./lib/v2/encoder');
var DecoderV2 = exports.DecoderV2 = require('./lib/v2/decoder');
exports.DecoderV2Rust = require('./lib/v2rust/decoder');

exports.encoderV1 = new EncoderV1({size: 1024 * 1024});
exports.encoderV2 = new EncoderV2({size: 1024 * 1024});

exports.decode = function decode(buf, version, options) {
  var classCache;
  var withType;

  if (version && typeof version !== 'string') {
    // buf, withType, version
    var t = version;
    version = options;
    options = t;
  }

  if (typeof options === 'boolean') {
    withType = options;
  }
  if (typeof options === 'object') {
    withType = options.withType;
    classCache = options.classCache;
  }
  withType = !!withType;

  if (version === '2.0') {
    return new DecoderV2(buf, classCache).read(withType);
  }
  return new DecoderV1(buf, classCache).read(withType);
};

exports.encode = function encode(obj, version) {
  var encoder;
  if (version === '2.0') {
    encoder = exports.encoderV2;
  } else {
    encoder = exports.encoderV1;
  }

  encoder.reset();
  return encoder.write(obj).get();
};
