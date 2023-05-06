'use strict';
var ByteBuffer = require('byte');

const maxCacheLength = process.env.maxCacheLength;
const Decoder = require("../../lib/v2rust/decoder");

const state = Decoder.makeState(maxCacheLength ? {
  maxCacheLength: parseInt(maxCacheLength),
} : {});
const decoder = new Decoder();
decoder.rustState = state;
module.exports = function read(bf) {
  const byteBuffer = ByteBuffer.wrap(bf);
  decoder.byteBuffer = byteBuffer;
  return decoder.read();
};