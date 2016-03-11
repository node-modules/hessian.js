/**
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.com)
 */

'use strict';

var EncoderV1 = exports.EncoderV1 = exports.Encoder = require('./lib/v1/encoder');
var DecoderV1 = exports.DecoderV1 = exports.Decoder = require('./lib/v1/decoder');

var EncoderV2 = exports.EncoderV2 = require('./lib/v2/encoder');
var DecoderV2 = exports.DecoderV2 = require('./lib/v2/decoder');

exports.encoderV1 = new EncoderV1({size: 1024 * 1024});
exports.encoderV2 = new EncoderV2({size: 1024 * 1024});

exports.decode = function decode(buf, version, withType) {
  if (typeof version === 'boolean') {
    // buf, withType, version
    var t = version;
    version = withType;
    withType = t;
  }

  withType = !!withType;

  if (version === '2.0') {
    return new DecoderV2(buf).read(withType);
  }
  return new DecoderV1(buf).read(withType);
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
