/**!
 * hessian.js - lib/decoder.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

var utils = require('./utils');
var ByteBuffer = require('byte');

var Debuger = function (buf) {
  this.byteBuffer = new ByteBuffer({
    array: buf
  });
};

/**
 * prototype of Debuger
 */
var proto = Debuger.prototype;

/**
 * init from a buffer
 * @param {Buffer} buf
 */
proto.init = function (buf) {
  this.byteBuffer.wrap(buf);
  return this;
};

proto.
