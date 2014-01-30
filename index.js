/**!
 * hessian.js - index.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

exports.Encoder = require('./lib/v1/encoder');
exports.Decoder = require('./lib/v1/decoder');

exports.decode = exports.Decoder.decode;
exports.encode = exports.Encoder.encode;

// java types
exports.java = require('./lib/java');
