/**!
 * hessian.js - test/utils.test.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

var assert = require('assert');
var utils = require('../lib/utils');

describe('utils.test.js', function () {
  describe('getSerializer()', function () {
    it('should [int get writeArray', function () {
      assert(utils.getSerializer('[int') === 'writeArray');
    });

    it('should [string get writeArray', function () {
      assert(utils.getSerializer('[string') === 'writeArray');
    });
  });
});
