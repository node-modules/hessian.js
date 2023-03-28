"use strict";

var assert = require('assert');
var utils = require('../../lib/utils');

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
