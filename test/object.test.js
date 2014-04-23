/**!
 * hessian.js - test/object.test.js
 *
 * Copyright(c) 2014
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
var hessian = require('../');
var utils = require('./utils');

describe('object.test.js', function () {
  describe('v2.0', function () {
    it('shold write enum Color', function () {
      hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'RED'
        }
      }, '2.0').should.eql(utils.bytes('v2/enum/red'));

      hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'GREEN'
        }
      }, '2.0').should.eql(utils.bytes('v2/enum/green'));

      hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'BLUE'
        }
      }, '2.0').should.eql(utils.bytes('v2/enum/blue'));
    });

    it('should read enum Color', function () {
      // enum Color {
      //   RED,
      //   GREEN,
      //   BLUE,
      // }

      // enum format:
      // O type 1 "name" o ref name-value
      hessian.decode(utils.bytes('v2/enum/red'), '2.0').should.eql({
        name: 'RED'
      });

      hessian.decode(utils.bytes('v2/enum/green'), '2.0', true).should.eql({
        $class: 'hessian.Main$Color',
        $: {
          name: 'GREEN'
        }
      });

      hessian.decode(utils.bytes('v2/enum/blue'), '2.0').should.eql({
        name: 'BLUE'
      });

      hessian.decode(utils.bytes('v2/enum/green'), '2.0').should.eql({
        name: 'GREEN'
      });

      hessian.decode(utils.bytes('v2/enum/red'), '2.0', true).should.eql({
        $class: 'hessian.Main$Color',
        $: {
          name: 'RED'
        }
      });
    });
  });
});
