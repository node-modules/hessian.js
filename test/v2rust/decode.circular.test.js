'use strict';

var assert = require('assert');
var utils = require('../utils');
var rustDecode = require('./rustdecoder');

describe('test/decode.circular.test.js', function () {
  it('v2 decode()', function () {
    var javabuf = utils.bytes('v2/object/ConnectionRequest');
    var connreq1 = rustDecode(javabuf);
    assert(connreq1.ctx && connreq1.ctx.id);
    assert(JSON.stringify(connreq1) === '{"ctx":{"id":101}}');
  });

});
