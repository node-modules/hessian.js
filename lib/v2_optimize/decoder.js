'use strict';

var util = require('util');
var DecoderV2 = require('../v2/decoder');
var DecoderV1 = require('../v1/decoder');

function Decoder(buf, classRefs) {
  DecoderV2.call(this, buf);
  this.classes = classRefs; // using passed in ref array
}

util.inherits(Decoder, DecoderV2);

var proto = Decoder.prototype;

proto.clean = function () {
  DecoderV1.prototype.clean.call(this); // can not clean `this.classes`
  this.types = [];
  return this;
};

module.exports = Decoder;
