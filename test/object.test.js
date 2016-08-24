/**
 * hessian.js - test/object.test.js
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

describe('object.test.js', function () {
  describe('v1.0', function () {

    it('should write null for property like: { a: { "$class": "yyy.yyy", "$": null } }', function () {
      var o = { '$class': 'xxx.xxx',
                '$': { a: { '$class': 'yyy.yyy', '$': null } } };
      var rightBuf = new Buffer('4d7400077878782e787878530001614e7a', 'hex');

      var buf = hessian.encode(o, '1.0');
      buf.should.length(rightBuf.length);
      buf.should.eql(rightBuf);
    });

    it('should write object for property like: { a: { "$class": "yyy.yyy", "$": {} } }', function () {
      var o = { '$class': 'xxx.xxx',
                '$': { a: { '$class': 'yyy.yyy', '$': {} } } };
      var rightBuf = new Buffer('4d7400077878782e787878530001614d7400077979792e7979797a7a', 'hex');

      var buf = hessian.encode(o, '1.0');
      buf.should.length(rightBuf.length);
      buf.should.eql(rightBuf);
    });

    it('should _assertType error when encode wrong object', function () {
      var req = {
        $class: 'com.alipay.x.biz.User',
        $: 'abc'
      };
      var rs;
      var buf;
      try {
        buf = hessian.encode(req, '1.0');
      } catch (err) {
        rs = err;
      }
      should.exist(rs);
      rs.message.should.containEql('com.alipay.x.biz.User');
      should.not.exist(buf);
    });

    it('should decode and encode ConnectionRequest', function () {
      var javabuf = utils.bytes('v1/object/ConnectionRequest');
      var connreq = hessian.decode(javabuf, '1.0', true);
      var jsconnreq = {
        $class: 'hessian.ConnectionRequest',
        $: {
          ctx: {
            $class: 'hessian.ConnectionRequest$RequestContext',
            $: {
              id: {
                $class: 'int',
                $: 101
              },
              // 'this$0': null
            }
          }
        }
      };

      // jsconnreq.$.ctx.$.this$0 = jsconnreq;
      connreq.should.eql(jsconnreq);
      var jsbuf = hessian.encode(connreq, '1.0');
      var jsbuf2 = hessian.encode(jsconnreq, '1.0');
      // because of skip field this$0, the length of course not eql.
      // jsbuf2.should.length(javabuf.length);
      // jsbuf2.should.eql(javabuf);

      // jsbuf.should.length(javabuf.length);
      // jsbuf.should.eql(javabuf);

      var jsbuf2Again = hessian.encode(jsconnreq, '1.0');
      jsbuf2Again.should.eql(jsbuf2);
    });

    it('should write enum Color', function () {
      hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'RED'
        }
      }, '1.0').should.eql(utils.bytes('v1/enum/red'));

      hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'GREEN'
        }
      }, '1.0').should.eql(utils.bytes('v1/enum/green'));

      hessian.encode({
        $class: 'hessian.Main$Color',
        $: {
          name: 'BLUE'
        }
      }, '1.0').should.eql(utils.bytes('v1/enum/blue'));
    });

    it('should write enum with ref', function () {
      // list = new ArrayList();
      // list.add(Color.BLUE);
      // list.add(Color.RED);
      // list.add(Color.GREEN);
      hessian.encode([
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'BLUE'
          }
        },
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'RED'
          }
        },
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'GREEN'
          }
        },
      ], '1.0').should.eql(utils.bytes('v1/enum/lists'));
    });

    it('should read enum Color', function () {
      // enum Color {
      //   RED,
      //   GREEN,
      //   BLUE,
      // }

      hessian.decode(utils.bytes('v1/enum/red'), '1.0').should.eql({
        name: 'RED'
      });

      hessian.decode(utils.bytes('v1/enum/green'), '1.0', true).should.eql({
        '$class': 'hessian.Main$Color',
        '$': {
          name: { '$class': 'java.lang.String', '$': 'GREEN' }
        }
      });

      hessian.decode(utils.bytes('v1/enum/blue'), '1.0').should.eql({
        name: 'BLUE'
      });

      hessian.decode(utils.bytes('v1/enum/green'), '1.0').should.eql({
        name: 'GREEN'
      });

      hessian.decode(utils.bytes('v1/enum/red'), '1.0', true).should.eql({
        '$class': 'hessian.Main$Color',
        '$': {
          name: { '$class': 'java.lang.String', '$': 'RED' }
        }
      });

      hessian.decode(utils.bytes('v1/enum/lists'), '1.0').should.eql(
        [ { name: 'BLUE' }, { name: 'RED' }, { name: 'GREEN' } ]
      );

      hessian.decode(utils.bytes('v1/enum/lists'), '1.0', true).should.eql({
        $class: 'java.util.ArrayList',
        $: [
          { '$class': 'hessian.Main$Color', '$': { name: { '$class': 'java.lang.String', '$': 'BLUE' } } },
          { '$class': 'hessian.Main$Color', '$': { name: { '$class': 'java.lang.String', '$': 'RED' } } },
          { '$class': 'hessian.Main$Color', '$': { name: { '$class': 'java.lang.String', '$': 'GREEN' } } }
        ]
      });
    });

    it('should write "{$class: "hessian.test.demo.Car", $: {a: 1}}"', function () {
      var obj = {
        $class: 'hessian.test.demo.Car',
        $: {a: 1, b: 'map'}
      };
      var buf = hessian.encode(obj, '1.0');
      buf[0].should.equal(0x4d); // 'M'
      hessian.decode(buf, '1.0').should.eql(obj.$);
      hessian.decode(buf, '1.0', true).should.eql( {
        '$class': 'hessian.test.demo.Car',
        '$': {
          a: { '$class': 'int', '$': 1 },
          b: { '$class': 'java.lang.String', '$': 'map' }
        }
      });
    });

    it('should read and write one car list', function () {
      hessian.decode(utils.bytes('v1/map/one_car_list'), '1.0').should.eql([
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 }
      ]);

      var cars = hessian.decode(utils.bytes('v1/map/one_car_list'), '1.0', true);
      cars.should.eql({
        $class: 'java.util.ArrayList',
        $: [
          {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 1' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }
        ]
      });

      hessian.encode(cars, '1.0').should.eql(utils.bytes('v1/map/one_car_list'));
    });

    it('should read and write two car list', function () {
      hessian.decode(utils.bytes('v1/map/two_car_list'), '1.0').should.eql([
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 2',
          color: 'aquamarine',
          mileage: 65536 }
      ]);

      var cars = hessian.decode(utils.bytes('v1/map/two_car_list'), '1.0', true);
      cars.should.eql({
        $class: 'java.util.ArrayList',
        $: [
          {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 1' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }, {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 2' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }
        ]
      });

      var buf = hessian.encode(cars, '1.0');
      buf.should.length(utils.bytes('v1/map/two_car_list').length);
      buf.should.eql(utils.bytes('v1/map/two_car_list'));
    });

    it('should read and write many cars', function () {
      // list = new ArrayList();
      // list.add(new Car("model 1"));
      // list.add(new Car("model 2"));
      // list.add(new Car("model 3"));
      hessian.decode(utils.bytes('v1/map/car_list'), '1.0').should.eql([
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 2',
          color: 'aquamarine',
          mileage: 65536 },
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 3',
          color: 'aquamarine',
          mileage: 65536 }
      ]);

      var cars = hessian.decode(utils.bytes('v1/map/car_list'), '1.0', true);
      cars.should.eql({
        $class: 'java.util.ArrayList',
        $: [
          {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 1' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }, {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 2' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }, {
            '$class': 'hessian.demo.Car',
            '$': {
              a: { '$class': 'java.lang.String', '$': 'a' },
              c: { '$class': 'java.lang.String', '$': 'c' },
              b: { '$class': 'java.lang.String', '$': 'b' },
              model: { '$class': 'java.lang.String', '$': 'model 3' },
              color: { '$class': 'java.lang.String', '$': 'aquamarine' },
              mileage: { '$class': 'int', '$': 65536 }
            }
          }
        ]
      });

      hessian.encode(cars, '1.0').should.eql(utils.bytes('v1/map/car_list'));
    });

    describe('java.util.concurrent.atomic.AtomicLong', function () {
      it('should read and write', function () {
        var javabuf = utils.bytes('v1/object/AtomicLong0');
        var a0 = hessian.decode(javabuf);
        a0.should.eql({value: 0});
        var a0 = hessian.decode(javabuf, true);
        a0.should.eql({
          $class: 'java.util.concurrent.atomic.AtomicLong',
          $: {
            value: {
              $: 0,
              $class: 'long'
            }
          }
        });
        hessian.encode(a0).should.eql(javabuf);

        javabuf = utils.bytes('v1/object/AtomicLong1');
        var a1 = hessian.decode(javabuf);
        a1.should.eql({value: 1});
        var a1 = hessian.decode(javabuf, true);
        a1.should.eql({
          $class: 'java.util.concurrent.atomic.AtomicLong',
          $: {
            value: {
              $: 1,
              $class: 'long'
            }
          }
        });
        hessian.encode(a1).should.eql(javabuf);
      });
    });
  });

  describe('v2.0', function () {
    it('should decode and encode ConnectionRequest', function () {
      var javabuf = utils.bytes('v2/object/ConnectionRequest');
      var connreq1 = hessian.decode(javabuf, '2.0');
      connreq1.should.have.keys('ctx');
      connreq1.ctx.should.have.keys('id'); // 'this$0'
      connreq1.ctx.id.should.equal(101);

      var connreq = hessian.decode(javabuf, '2.0', true);
      var jsconnreq = {
        $class: 'hessian.ConnectionRequest',
        $: {
          ctx: {
            $class: 'hessian.ConnectionRequest$RequestContext',
            $: {
              id: 101,
              // 'this$0': null
            }
          }
        }
      };

      // jsconnreq.$.ctx.$.this$0 = jsconnreq;
      jsconnreq.should.eql(connreq);
      var jsbuf = hessian.encode(connreq, '2.0');
      var jsbuf2 = hessian.encode(jsconnreq, '2.0');
      // jsbuf2.should.length(javabuf.length);
      // jsbuf2.should.eql(javabuf);

      // jsbuf.should.length(javabuf.length);
      // jsbuf.should.eql(javabuf);
    });

    it('should decode hessian 1.0 ConnectionRequest', function () {
      var javabuf = utils.bytes('v1/object/ConnectionRequest');
      var connreq = hessian.decode(javabuf, '1.0', true);
      connreq.$class.should.equal('hessian.ConnectionRequest');
      connreq.$.ctx.$class.should.equal('hessian.ConnectionRequest$RequestContext');
    });

    it('should write enum Color', function () {
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

    // it('should read hessian 1.0 enum Color', function () {
    //   hessian.decode(utils.bytes('v1/enum/red'), '2.0', true).should.eql({
    //     $class: 'hessian.Main$Color',
    //     $: {
    //       name: 'RED'
    //     }
    //   });

    //   hessian.decode(utils.bytes('v1/enum/green'), '2.0', false).should.eql({
    //     name: 'GREEN'
    //   });

    //   hessian.decode(utils.bytes('v1/enum/blue'), '2.0', true).should.eql({
    //     $class: 'hessian.Main$Color',
    //     $: {
    //       name: 'BLUE'
    //     }
    //   });
    // });

    it('should write enum with ref', function () {
      // list = new ArrayList();
      // list.add(Color.BLUE);
      // list.add(Color.RED);
      // list.add(Color.GREEN);
      hessian.encode([
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'BLUE'
          }
        },
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'RED'
          }
        },
        {
          $class: 'hessian.Main$Color',
          $: {
            name: 'GREEN'
          }
        },
      ], '2.0').should.eql(utils.bytes('v2/enum/lists'));
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

      hessian.decode(utils.bytes('v2/enum/lists'), '2.0').should.eql(
        [ { name: 'BLUE' }, { name: 'RED' }, { name: 'GREEN' } ]
      );

      hessian.decode(utils.bytes('v2/enum/lists'), '2.0', true).should.eql([
        { '$class': 'hessian.Main$Color', '$': { name: 'BLUE' } },
        { '$class': 'hessian.Main$Color', '$': { name: 'RED' } },
        { '$class': 'hessian.Main$Color', '$': { name: 'GREEN' } }
      ]);
    });

    it('should write "{$class: "hessian.test.demo.Car", $: {a: 1}}"', function () {
      var obj = {
        $class: 'hessian.test.demo.Car',
        $: {a: 1, b: 'map'}
      };
      var buf = hessian.encode(obj, '2.0');
      buf[0].should.equal(0x43);
      hessian.decode(buf, '2.0').should.eql(obj.$);
      hessian.decode(buf, '2.0', true).should.eql(obj);
    });

    it('should read one car list', function () {
      hessian.decode(utils.bytes('v2/map/one_car_list'), '2.0').should.eql([
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 }
      ]);

      var cars = hessian.decode(utils.bytes('v2/map/one_car_list'), '2.0', true);
      cars.should.eql([
        {
          $class: 'hessian.demo.Car',
          $: {
            a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 1',
            color: 'aquamarine',
            mileage: 65536 }
        }
      ]);

      hessian.encode(cars, '2.0').should.eql(utils.bytes('v2/map/one_car_list'));
    });

    it('should read two car list', function () {
      hessian.decode(utils.bytes('v2/map/two_car_list'), '2.0').should.eql([
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 2',
          color: 'aquamarine',
          mileage: 65536 }
      ]);

      var cars = hessian.decode(utils.bytes('v2/map/two_car_list'), '2.0', true);
      cars.should.eql([
        {
          $class: 'hessian.demo.Car',
          $: {
            a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 1',
            color: 'aquamarine',
            mileage: 65536 }
        },
        {
          $class: 'hessian.demo.Car',
          $: {
            a: 'a',
            c: 'c',
            b: 'b',
            model: 'model 2',
            color: 'aquamarine',
            mileage: 65536 }
        }
      ]);

      var buf = hessian.encode(cars, '2.0');
      buf.should.length(utils.bytes('v2/map/two_car_list').length);
      buf.should.eql(utils.bytes('v2/map/two_car_list'));
    });

    it('should read many cars', function () {
      // list = new ArrayList();
      // list.add(new Car("model 1"));
      // list.add(new Car("model 2"));
      // list.add(new Car("model 3"));
      hessian.decode(utils.bytes('v2/map/car_list'), '2.0').should.eql([
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 1',
          color: 'aquamarine',
          mileage: 65536 },
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 2',
          color: 'aquamarine',
          mileage: 65536 },
        { a: 'a',
          c: 'c',
          b: 'b',
          model: 'model 3',
          color: 'aquamarine',
          mileage: 65536 }
      ]);

      var cars = hessian.decode(utils.bytes('v2/map/car_list'), '2.0', true);
      cars.should.eql([
        { '$class': 'hessian.demo.Car',
          '$':
           { a: 'a',
             c: 'c',
             b: 'b',
             model: 'model 1',
             color: 'aquamarine',
             mileage: 65536 } },
        { '$class': 'hessian.demo.Car',
          '$':
           { a: 'a',
             c: 'c',
             b: 'b',
             model: 'model 2',
             color: 'aquamarine',
             mileage: 65536 } },
        { '$class': 'hessian.demo.Car',
          '$':
           { a: 'a',
             c: 'c',
             b: 'b',
             model: 'model 3',
             color: 'aquamarine',
             mileage: 65536 } }
      ]);

      hessian.encode(cars, '2.0').should.eql(utils.bytes('v2/map/car_list'));
    });

    // it('should read hessian 1.0 one car list', function () {
    //   hessian.decode(utils.bytes('v1/map/one_car_list'), '2.0').should.eql([
    //     { a: 'a',
    //       c: 'c',
    //       b: 'b',
    //       model: 'model 1',
    //       color: 'aquamarine',
    //       mileage: 65536 }
    //   ]);

    //   var cars = hessian.decode(utils.bytes('v1/map/one_car_list'), '2.0', true);
    //   cars.should.eql([
    //     {
    //       $class: 'hessian.demo.Car',
    //       $: {
    //         a: 'a',
    //         c: 'c',
    //         b: 'b',
    //         model: 'model 1',
    //         color: 'aquamarine',
    //         mileage: 65536 }
    //     }
    //   ]);
    // });

    // it('should read hessian 1.0 two car list', function () {
    //   hessian.decode(utils.bytes('v1/map/two_car_list'), '2.0').should.eql([
    //     { a: 'a',
    //       c: 'c',
    //       b: 'b',
    //       model: 'model 1',
    //       color: 'aquamarine',
    //       mileage: 65536 },
    //     { a: 'a',
    //       c: 'c',
    //       b: 'b',
    //       model: 'model 2',
    //       color: 'aquamarine',
    //       mileage: 65536 }
    //   ]);

    //   var cars = hessian.decode(utils.bytes('v1/map/two_car_list'), '2.0', true);
    //   cars.should.eql([
    //     {
    //       $class: 'hessian.demo.Car',
    //       $: {
    //         a: 'a',
    //         c: 'c',
    //         b: 'b',
    //         model: 'model 1',
    //         color: 'aquamarine',
    //         mileage: 65536 }
    //     },
    //     {
    //       $class: 'hessian.demo.Car',
    //       $: {
    //         a: 'a',
    //         c: 'c',
    //         b: 'b',
    //         model: 'model 2',
    //         color: 'aquamarine',
    //         mileage: 65536 }
    //     }
    //   ]);
    // });

    // it('should read hessian 1.0 many cars', function () {
    //   // list = new ArrayList();
    //   // list.add(new Car("model 1"));
    //   // list.add(new Car("model 2"));
    //   // list.add(new Car("model 3"));
    //   hessian.decode(utils.bytes('v1/map/car_list'), '2.0').should.eql([
    //     { a: 'a',
    //       c: 'c',
    //       b: 'b',
    //       model: 'model 1',
    //       color: 'aquamarine',
    //       mileage: 65536 },
    //     { a: 'a',
    //       c: 'c',
    //       b: 'b',
    //       model: 'model 2',
    //       color: 'aquamarine',
    //       mileage: 65536 },
    //     { a: 'a',
    //       c: 'c',
    //       b: 'b',
    //       model: 'model 3',
    //       color: 'aquamarine',
    //       mileage: 65536 }
    //   ]);

    //   var cars = hessian.decode(utils.bytes('v1/map/car_list'), '2.0', true);
    //   cars.should.eql([
    //     { '$class': 'hessian.demo.Car',
    //       '$':
    //        { a: 'a',
    //          c: 'c',
    //          b: 'b',
    //          model: 'model 1',
    //          color: 'aquamarine',
    //          mileage: 65536 } },
    //     { '$class': 'hessian.demo.Car',
    //       '$':
    //        { a: 'a',
    //          c: 'c',
    //          b: 'b',
    //          model: 'model 2',
    //          color: 'aquamarine',
    //          mileage: 65536 } },
    //     { '$class': 'hessian.demo.Car',
    //       '$':
    //        { a: 'a',
    //          c: 'c',
    //          b: 'b',
    //          model: 'model 3',
    //          color: 'aquamarine',
    //          mileage: 65536 } }
    //   ]);
    // });

    describe('java.util.concurrent.atomic.AtomicLong', function () {
      it('should read and write', function () {
        var javabuf = utils.bytes('v2/object/AtomicLong0');
        var a0 = hessian.decode(javabuf, '2.0');
        a0.should.eql({value: 0});
        var a0 = hessian.decode(javabuf, '2.0', true);
        a0.should.eql({
          $class: 'java.util.concurrent.atomic.AtomicLong',
          $: {
            value: 0
          }
        });
        hessian.encode({
          $class: 'java.util.concurrent.atomic.AtomicLong',
          $: {
            value: {
              $class: 'long',
              $: 0
            }
          }
        }, '2.0').should.eql(javabuf);

        javabuf = utils.bytes('v2/object/AtomicLong1');
        var a1 = hessian.decode(javabuf, '2.0');
        a1.should.eql({value: 1});
        var a1 = hessian.decode(javabuf, '2.0', true);
        a1.should.eql({
          $class: 'java.util.concurrent.atomic.AtomicLong',
          $: {
            value: 1
          }
        });
        hessian.encode({
          $class: 'java.util.concurrent.atomic.AtomicLong',
          $: {
            value: {
              $class: 'long',
              $: 1
            }
          }
        }, '2.0').should.eql(javabuf);
      });
    });
  });
});
