/**
 * hessian.js - lib/v2/encoder.js
 *
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 *   denghongcai <admin@dhcouse.com> (https://www.dhc.house)
 * 
 */

"use strict";

/**
 * Module dependencies.
 */

var debug = require('debug')('hessian:v2_optimize:encoder');
var util = require('util');
var EncoderV2 = require('../v2/encoder');
var EncoderV1 = require('../v1/encoder');

function Encoder(options) {
  EncoderV2.call(this, options);

  this._classRefs = options.classRefs;
  this._classRefFields = options.classRefFields;
  this._typeRefs = [];
}

util.inherits(Encoder, EncoderV2);

var proto = Encoder.prototype;

/**
 * clean the buf
 */
proto.reset = proto.clean = function () {
  EncoderV1.prototype.clean.call(this);
  this._typeRefs = [];
  return this;
};

module.exports = Encoder;
