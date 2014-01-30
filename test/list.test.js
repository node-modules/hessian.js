/*!
 * hessian.js - test/list.test.js
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

describe('list.test.js', function () {
  var intListBuffer = Buffer.concat([
    new Buffer([
      'V'.charCodeAt(0),
      't'.charCodeAt(0), 0x00, 0x04
    ]),
    new Buffer('[int'),
    new Buffer([
      'l'.charCodeAt(0), 0, 0, 0, 0x02,
      'I'.charCodeAt(0), 0, 0, 0, 0x00,
      'I'.charCodeAt(0), 0, 0, 0, 0x01,
      'z'.charCodeAt(0)
    ])
  ]);

  it('should read int[] = {0, 1}', function () {
    hessian.decode(intListBuffer).should.eql([0, 1]);
    hessian.decode(intListBuffer, true).should.eql({
      '$class': '[int', '$': [ 0, 1 ]
    });
  });

  it('should write int[] = {0, 1}', function () {
    var buf = hessian.encode(hessian.java.intList([0, 1]));
    buf.should.be.a.Buffer;
    buf.should.length(intListBuffer.length);
    buf.should.eql(intListBuffer);

    hessian.encode({
      $class: '[int',
      $: [0, 1]
    }).should.eql(intListBuffer);

    // empty list
    var empty = Buffer.concat([
      new Buffer([
        'V'.charCodeAt(0),
        't'.charCodeAt(0), 0x00, 0x04
      ]),
      new Buffer('[int'),
      new Buffer([
        'l'.charCodeAt(0), 0, 0, 0, 0x00,
        'z'.charCodeAt(0)
      ])
    ]);
    hessian.decode(empty).should.eql([]);
  });

  it('should read write anonymous variable-length list = {0, null, "foobar"}', function () {
    var anonymousList = Buffer.concat([
      new Buffer('V'),
      new Buffer([
        'I'.charCodeAt(0), 0, 0, 0, 0x00,
        'N'.charCodeAt(0),
        'S'.charCodeAt(0), 0, 0x06,
      ]),
      new Buffer('foobar'),
      new Buffer('z'),
    ]);

    hessian.decode(anonymousList).should.eql([0, null, 'foobar']);

    // empty
    var emptyList = Buffer.concat([
      new Buffer('V'),
      new Buffer('z'),
    ]);
    hessian.decode(emptyList).should.eql([]);
  });

  describe('v2.0', function () {
    it('should read fixed-length typed list', function () {
      // Serialization of a typed int array: int[] = {0, 1}
      var buf = Buffer.concat([
        new Buffer([
          'V'.charCodeAt(0),
          0x04,
        ]),
        new Buffer('[int'),
        new Buffer([
          0x92,
          0x90, 0x91
        ])
      ]);
      hessian.decode(buf, '2.0').should.eql([0, 1]);
      hessian.decode(buf, '2.0', true).should.eql({
        $class: '[int',
        $: [0, 1]
      });

      buf = Buffer.concat([
        new Buffer([
          'V'.charCodeAt(0),
          0x04,
        ]),
        new Buffer('[int'),
        new Buffer([
          0x90,
        ])
      ]);
      hessian.decode(buf, '2.0').should.eql([]);
    });

    it('should read variable-length typed list', function () {
      // x55 type value* 'Z'   # variable-length list
      // string[] = {"foo", "bar"}
      var buf = Buffer.concat([
        new Buffer([
          0x55,
          0x07,
        ]),
        new Buffer('[string'),

        new Buffer([
          0x03,
        ]),
        new Buffer('foo'),

        new Buffer([
          0x03,
        ]),
        new Buffer('bar'),

        new Buffer([
          'Z'.charCodeAt(0)
        ])
      ]);
      hessian.decode(buf, '2.0').should.eql(['foo', 'bar']);
      hessian.decode(buf, '2.0', true).should.eql({
        $class: '[string',
        $: ['foo', 'bar']
      });

      buf = Buffer.concat([
        new Buffer([
          0x55,
          0x07,
        ]),
        new Buffer('[string'),

        new Buffer([
          0x03,
        ]),
        new Buffer('foo'),

        new Buffer('N'),

        new Buffer([
          0x03,
        ]),
        new Buffer('bar'),

        new Buffer([
          'Z'.charCodeAt(0)
        ])
      ]);
      hessian.decode(buf, '2.0').should.eql(['foo', null, 'bar']);

      buf = Buffer.concat([
        new Buffer([
          0x55,
          0x07,
        ]),
        new Buffer('[string'),

        new Buffer([
          'Z'.charCodeAt(0)
        ])
      ]);
      hessian.decode(buf, '2.0').should.eql([]);
    });

    it('should read variable-length untyped list', function () {
      // x57 value* 'Z'
      // untyped variable-length list = {0, 1}
      var buf = Buffer.concat([
        new Buffer([
          0x57,
          0x90, 0x91,
          'Z'.charCodeAt(0)
        ])
      ]);
      hessian.decode(buf, '2.0').should.eql([0, 1]);

      buf = Buffer.concat([
        new Buffer([
          0x57,
          0x90, 0x91, 'N'.charCodeAt(0),
          'Z'.charCodeAt(0)
        ])
      ]);
      hessian.decode(buf, '2.0').should.eql([0, 1, null]);

      buf = Buffer.concat([
        new Buffer([
          0x57,
          'Z'.charCodeAt(0)
        ])
      ]);
      hessian.decode(buf, '2.0').should.eql([]);
    });

    it('should read fixed-length untyped list', function () {
      // x58 int value*
      var buf = Buffer.concat([
        new Buffer([
          // [0, 1]
          0x58,
          0x92,
          0x90, 0x91,

          // []
          0x78,

          // [3, 4, 5]
          0x7b,
          0x93, 0x94, 0x95,

          // []
          0x78
        ])
      ]);
      var decoder = new hessian.Decoder(buf, '2.0');
      decoder.read().should.eql([0, 1]);
      decoder.read().should.eql([]);
      decoder.read().should.eql([3, 4, 5]);
      decoder.read().should.eql([]);
    });

    it('should read compact fixed-length typed list', function () {
      // [0, 1], [2, 3, 4]
      // x72                # typed list length=2
      //   x04 [int         # type for int[] (save as type #0)
      //   x90              # integer 0
      //   x91              # integer 1

      // x73                # typed list length = 3
      //   x90              # type reference to int[] (integer #0)
      //   x92              # integer 2
      //   x93              # integer 3
      //   x94              # integer 4

      var buf = Buffer.concat([
        new Buffer([
          'V'.charCodeAt(0),
          0x04,
        ]),
        new Buffer('[int'),
        new Buffer([
          0x92,
          0x90, 0x91
        ]),

        new Buffer([
          0x73, // 's'
          0x90,
          0x92,
          0x93,
          0x94
        ]),

        // [0]
        new Buffer([
          0x71,
          0x90,
          0x90,
        ]),

        // []
        new Buffer([
          0x70,
          0x90,
        ])
      ]);

      var decoder = new hessian.Decoder(buf, '2.0');
      decoder.read().should.eql([0, 1]);
      decoder.read(true).should.eql({
        $class: '[int',
        $: [2, 3, 4]
      });

      decoder.read().should.eql([0]);

      decoder.read(true).should.eql({
        $class: '[int',
        $: []
      });
    });
  });
});
