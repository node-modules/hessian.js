'use strict';
var ByteBuffer = require('byte');

const maxCacheLength = process.env.maxCacheLength;
const Decoder = require("../../lib/v2rust/decoder");

const state = Decoder.makeState(maxCacheLength ? {
  maxCacheLength: parseInt(maxCacheLength),
} : {});
const decoder = new Decoder();
decoder.rustState = state;
module.exports = [function read(bf) {
  decoder.byteBuffer = ByteBuffer.wrap(bf);
  return decoder.read();
}, state.dump, state.drain, state.usage];