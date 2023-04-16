'use strict';

const { describe, it } = require('test');
const assert = require('assert');
const utils = require('../lib/utils');

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
