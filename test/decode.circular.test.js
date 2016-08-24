/**
 * hessian.js - test/decode.circular.test.js
 *
 * Copyright(c)
 *
 * Authors:
 *   tangyao <tangyao@alipay.com> (http://tangyao.me/)
 */

'use strict';

/**
 * Module dependencies.
 */

var should = require('should');
var hessian = require('../');
var utils = require('./utils');

describe('test/decode.circular.test.js', function () {

  it('v1 decode()', function () {
    var data = new Buffer([77, 116, 0, 49, 99, 111, 109, 46, 97, 108, 105, 112, 97, 121, 46, 99, 111, 110, 102, 105, 103, 115, 101, 114, 118, 101, 114, 46, 99, 111, 110, 102, 114, 101, 103, 95, 116, 101, 115, 116, 46, 79, 110, 108, 105, 110, 101, 77, 111, 100, 117, 108, 101, 83, 0, 6, 109, 111, 100, 117, 108, 101, 83, 0, 1, 97, 83, 0, 4, 100, 101, 115, 99, 83, 0, 1, 98, 83, 0, 8, 118, 101, 114, 115, 105, 111, 110, 115, 86, 108, 0, 0, 0, 1, 77, 116, 0, 57, 99, 111, 109, 46, 97, 108, 105, 112, 97, 121, 46, 99, 111, 110, 102, 105, 103, 115, 101, 114, 118, 101, 114, 46, 99, 111, 110, 102, 114, 101, 103, 95, 116, 101, 115, 116, 46, 79, 110, 108, 105, 110, 101, 77, 111, 100, 117, 108, 101, 36, 86, 101, 114, 115, 105, 111, 110, 83, 0, 7, 118, 101, 114, 115, 105, 111, 110, 83, 0, 1, 99, 83, 0, 6, 97, 115, 115, 101, 116, 115, 86, 108, 0, 0, 0, 1, 83, 0, 1, 105, 122, 83, 0, 6, 116, 104, 105, 115, 36, 48, 82, 0, 0, 0, 0, 122, 122, 122]);
    var rs = hessian.decode(data);
    JSON.stringify(rs).should.eql('{"module":"a","desc":"b","versions":[{"version":"c","assets":["i"]}]}');
  });
  

  it('v2 decode()', function () {
    var javabuf = utils.bytes('v2/object/ConnectionRequest');
    var connreq1 = hessian.decode(javabuf, '2.0');
    connreq1.should.have.keys('ctx');
    connreq1.ctx.should.have.keys('id');
    JSON.stringify(connreq1).should.eql('{"ctx":{"id":101}}');
  });

});
