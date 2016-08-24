/**
 * hessian.js - test/utils.test.js
 *
 * Copyright(c)
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var utils = require('../lib/utils');

describe('utils.test.js', function () {
  describe('getSerializer()', function () {
    it('should [int get writeArray', function () {
      utils.getSerializer('[int').should.equal('writeArray');
    });

    it('should [string get writeArray', function () {
      utils.getSerializer('[string').should.equal('writeArray');
    });
  });
});
