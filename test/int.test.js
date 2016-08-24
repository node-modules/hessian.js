/**
 * hessian.js - test/int.test.js
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
var hessian = require('../');
var utils = require('./utils');

describe('int.test.js', function () {
  it('should read integer 300', function () {
    hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c])).should.equal(300);
  });

  it('should write integer 300', function () {
    hessian.encode(300).should.eql(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c]));
  });

  it('should write integer 0', function () {
    hessian.encode(0).should.eql(new Buffer(['I'.charCodeAt(0), 0, 0, 0, 0]));
  });

  it('should write number as java write', function () {
    hessian.encode(0, '1.0').should.eql(utils.bytes('v1/number/0'));
    hessian.encode(1).should.eql(utils.bytes('v1/number/1'));
    hessian.encode(10).should.eql(utils.bytes('v1/number/10'));
    hessian.encode(16).should.eql(utils.bytes('v1/number/16'));
    hessian.encode(2047).should.eql(utils.bytes('v1/number/2047'));
    hessian.encode(255, '1.0').should.eql(utils.bytes('v1/number/255'));
    hessian.encode(256, '1.0').should.eql(utils.bytes('v1/number/256'));
    hessian.encode(262143, '1.0').should.eql(utils.bytes('v1/number/262143'));
    hessian.encode(262144, '1.0').should.eql(utils.bytes('v1/number/262144'));
    hessian.encode(46, '1.0').should.eql(utils.bytes('v1/number/46'));
    hessian.encode(47, '1.0').should.eql(utils.bytes('v1/number/47'));

    hessian.encode(-16, '1.0').should.eql(utils.bytes('v1/number/-16'));
    hessian.encode(-2048, '1.0').should.eql(utils.bytes('v1/number/-2048'));
    hessian.encode(-256).should.eql(utils.bytes('v1/number/-256'));
    hessian.encode(-262144, '1.0').should.eql(utils.bytes('v1/number/-262144'));
    hessian.encode(-262145, '1.0').should.eql(utils.bytes('v1/number/-262145'));
  });

  it('should read java number bin', function () {
    hessian.decode(utils.bytes('v1/number/0'), '1.0').should.equal(0);
    hessian.decode(utils.bytes('v1/number/1'), '1.0').should.equal(1);
    hessian.decode(utils.bytes('v1/number/10'), '1.0').should.equal(10);
    hessian.decode(utils.bytes('v1/number/16'), '1.0').should.equal(16);
    hessian.decode(utils.bytes('v1/number/2047'), '1.0').should.equal(2047);
    hessian.decode(utils.bytes('v1/number/255'), '1.0').should.equal(255);
    hessian.decode(utils.bytes('v1/number/256'), '1.0').should.equal(256);
    hessian.decode(utils.bytes('v1/number/262143'), '1.0').should.equal(262143);
    hessian.decode(utils.bytes('v1/number/262144'), '1.0').should.equal(262144);
    hessian.decode(utils.bytes('v1/number/46'), '1.0').should.equal(46);
    hessian.decode(utils.bytes('v1/number/47'), '1.0').should.equal(47);
    hessian.decode(utils.bytes('v1/number/-16'), '1.0').should.equal(-16);
    hessian.decode(utils.bytes('v1/number/-2048'), '1.0').should.equal(-2048);
    hessian.decode(utils.bytes('v1/number/-256'), '1.0').should.equal(-256);
    hessian.decode(utils.bytes('v1/number/-262144'), '1.0').should.equal(-262144);
    hessian.decode(utils.bytes('v1/number/-262145'), '1.0').should.equal(-262145);
  });

  describe('v2.0', function () {
    it('should read compact integers', function () {
      hessian.decode(new Buffer([0x90]), '2.0').should.equal(0);
      hessian.decode(new Buffer([0x80]), '2.0').should.equal(-16);
      hessian.decode(new Buffer([0xbf]), '2.0').should.equal(47);

      hessian.decode(new Buffer([0xc8, 0x00]), '2.0').should.equal(0);
      hessian.decode(new Buffer([0xc0, 0x00]), '2.0').should.equal(-2048);
      hessian.decode(new Buffer([0xc7, 0x00]), '2.0').should.equal(-256);
      hessian.decode(new Buffer([0xcf, 0xff]), '2.0').should.equal(2047);

      hessian.decode(new Buffer([0xd4, 0x00, 0x00]), '2.0').should.equal(0);
      hessian.decode(new Buffer([0xd0, 0x00, 0x00]), '2.0').should.equal(-262144);
      hessian.decode(new Buffer([0xd7, 0xff, 0xff]), '2.0').should.equal(262143);

      hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x00, 0x00]), '2.0').should.equal(0);
      hessian.decode(new Buffer(['I'.charCodeAt(0), 0x00, 0x00, 0x01, 0x2c]), '2.0').should.equal(300);
    });

    it('should write number as java write', function () {
      hessian.encode(0, '2.0').should.eql(utils.bytes('v2/number/0'));
      hessian.encode(1, '2.0').should.eql(utils.bytes('v2/number/1'));
      hessian.encode(10, '2.0').should.eql(utils.bytes('v2/number/10'));
      hessian.encode(16, '2.0').should.eql(utils.bytes('v2/number/16'));
      hessian.encode(2047, '2.0').should.eql(utils.bytes('v2/number/2047'));
      hessian.encode(255, '2.0').should.eql(utils.bytes('v2/number/255'));
      hessian.encode(256, '2.0').should.eql(utils.bytes('v2/number/256'));
      hessian.encode(262143, '2.0').should.eql(utils.bytes('v2/number/262143'));
      hessian.encode(262144, '2.0').should.eql(utils.bytes('v2/number/262144'));
      hessian.encode(46, '2.0').should.eql(utils.bytes('v2/number/46'));
      hessian.encode(47, '2.0').should.eql(utils.bytes('v2/number/47'));
      hessian.encode(-16, '2.0').should.eql(utils.bytes('v2/number/-16'));
      hessian.encode(-2048, '2.0').should.eql(utils.bytes('v2/number/-2048'));
      hessian.encode(-256, '2.0').should.eql(utils.bytes('v2/number/-256'));
      hessian.encode(-262144, '2.0').should.eql(utils.bytes('v2/number/-262144'));
      hessian.encode(-262145, '2.0').should.eql(utils.bytes('v2/number/-262145'));
    });

    it('should read java number bin', function () {
      hessian.decode(utils.bytes('v2/number/0'), '2.0').should.equal(0);
      hessian.decode(utils.bytes('v2/number/1'), '2.0').should.equal(1);
      hessian.decode(utils.bytes('v2/number/10'), '2.0').should.equal(10);
      hessian.decode(utils.bytes('v2/number/16'), '2.0').should.equal(16);
      hessian.decode(utils.bytes('v2/number/2047'), '2.0').should.equal(2047);
      hessian.decode(utils.bytes('v2/number/255'), '2.0').should.equal(255);
      hessian.decode(utils.bytes('v2/number/256'), '2.0').should.equal(256);
      hessian.decode(utils.bytes('v2/number/262143'), '2.0').should.equal(262143);
      hessian.decode(utils.bytes('v2/number/262144'), '2.0').should.equal(262144);
      hessian.decode(utils.bytes('v2/number/46'), '2.0').should.equal(46);
      hessian.decode(utils.bytes('v2/number/47'), '2.0').should.equal(47);
      hessian.decode(utils.bytes('v2/number/-16'), '2.0').should.equal(-16);
      hessian.decode(utils.bytes('v2/number/-2048'), '2.0').should.equal(-2048);
      hessian.decode(utils.bytes('v2/number/-256'), '2.0').should.equal(-256);
      hessian.decode(utils.bytes('v2/number/-262144'), '2.0').should.equal(-262144);
      hessian.decode(utils.bytes('v2/number/-262145'), '2.0').should.equal(-262145);
    });

    it('should read hessian 1.0 number bin', function () {
      hessian.decode(utils.bytes('v1/number/0'), '2.0').should.equal(0);
      hessian.decode(utils.bytes('v1/number/1'), '2.0').should.equal(1);
      hessian.decode(utils.bytes('v1/number/10'), '2.0').should.equal(10);
      hessian.decode(utils.bytes('v1/number/16'), '2.0').should.equal(16);
      hessian.decode(utils.bytes('v1/number/2047'), '2.0').should.equal(2047);
      hessian.decode(utils.bytes('v1/number/255'), '2.0').should.equal(255);
      hessian.decode(utils.bytes('v1/number/256'), '2.0').should.equal(256);
      hessian.decode(utils.bytes('v1/number/262143'), '2.0').should.equal(262143);
      hessian.decode(utils.bytes('v1/number/262144'), '2.0').should.equal(262144);
      hessian.decode(utils.bytes('v1/number/46'), '2.0').should.equal(46);
      hessian.decode(utils.bytes('v1/number/47'), '2.0').should.equal(47);
      hessian.decode(utils.bytes('v1/number/-16'), '2.0').should.equal(-16);
      hessian.decode(utils.bytes('v1/number/-2048'), '2.0').should.equal(-2048);
      hessian.decode(utils.bytes('v1/number/-256'), '2.0').should.equal(-256);
      hessian.decode(utils.bytes('v1/number/-262144'), '2.0').should.equal(-262144);
      hessian.decode(utils.bytes('v1/number/-262145'), '2.0').should.equal(-262145);
    });

    it('should write compact integers', function () {
      // -16 ~ 47
      var buf = hessian.encode(0, '2.0');
      buf.should.length(1);
      buf[0].should.equal(0x90);
      buf.should.eql(new Buffer([0x90]));

      buf = hessian.encode(1, '2.0');
      buf.should.length(1);
      buf[0].should.equal(0x91);
      buf.should.eql(new Buffer([0x91]));

      buf = hessian.encode(-16, '2.0');
      buf.should.length(1);
      buf[0].should.equal(0x80);
      buf.should.eql(new Buffer([0x80]));

      buf = hessian.encode(46, '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xbe);
      buf.should.eql(new Buffer([0xbe]));

      buf = hessian.encode(47, '2.0');
      buf.should.length(1);
      buf[0].should.equal(0xbf);
      buf.should.eql(new Buffer([0xbf]));

      // -2048 ~ 2047
      buf = hessian.encode(-2048, '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xc0);
      buf[1].should.equal(0x00);
      buf.should.eql(new Buffer([0xc0, 0x00]));

      buf = hessian.encode(-256, '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xc7);
      buf[1].should.equal(0x00);
      buf.should.eql(new Buffer([0xc7, 0x00]));

      buf = hessian.encode(255, '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xc8);
      buf[1].should.equal(0xff);
      buf.should.eql(new Buffer([0xc8, 0xff]));

      buf = hessian.encode(256, '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xc9);
      buf[1].should.equal(0x00);
      buf.should.eql(new Buffer([0xc9, 0x00]));

      buf = hessian.encode(2047, '2.0');
      buf.should.length(2);
      buf[0].should.equal(0xcf);
      buf[1].should.equal(0xff);
      buf.should.eql(new Buffer([0xcf, 0xff]));

      // -262144 ~ 262143
      buf = hessian.encode(-262144, '2.0');
      buf.should.length(3);
      buf[0].should.equal(0xd0);
      buf[1].should.equal(0x00);
      buf[2].should.equal(0x00);
      buf.should.eql(new Buffer([0xd0, 0x00, 0x00]));

      buf = hessian.encode(262143, '2.0');
      buf.should.length(3);
      buf[0].should.equal(0xd7);
      buf[1].should.equal(0xff);
      buf[2].should.equal(0xff);
      buf.should.eql(new Buffer([0xd7, 0xff, 0xff]));

      // 262144
      buf = hessian.encode(262144, '2.0');
      buf.should.length(5);
      buf[0].should.equal('I'.charCodeAt(0));
      buf[1].should.equal(0x00);
      buf[2].should.equal(0x04);
      buf[3].should.equal(0x00);
      buf[4].should.equal(0x00);
      buf.should.eql(new Buffer(['I'.charCodeAt(0), 0x00, 0x04, 0x00, 0x00]));

      buf = hessian.encode(-262145, '2.0');
      buf.should.length(5);
      buf[0].should.equal('I'.charCodeAt(0));
      buf[1].should.equal(0xff);
      buf[2].should.equal(0xfb);
      buf[3].should.equal(0xff);
      buf[4].should.equal(0xff);
      buf.should.eql(new Buffer(['I'.charCodeAt(0), 0xff, 0xfb, 0xff, 0xff]));
    });
  });
});
