'use strict';

const assert = require('assert');
const hessian = require('../');
const ensureValidIdentifier = require('../lib/utils').ensureValidIdentifier;

describe('test/special_cases.test', function() {
  it('should encode map like object in version: 1.0', function() {
    const buf = hessian.encode({
      $class: 'org.bson.Document',
      $: {
        _id: {
          $class: 'org.bson.Document',
          $: {
            $in: [
              '5bd6a201c816e527d97cb1ad',
            ],
          },
          isMap: true,
        },
      },
      isMap: true,
    }, '1.0');
    const output = hessian.decode(buf, '1.0', true);
    assert.deepEqual(output, {
      $class: 'org.bson.Document',
      $: {
        _id: {
          $class: 'org.bson.Document',
          $: {
            $in: {
              $class: 'java.util.ArrayList',
              $: [{
                $class: 'java.lang.String',
                $: '5bd6a201c816e527d97cb1ad',
              }],
            },
          },
        },
      },
    });
  });

  it('should encode map like object in version: 2.0', function() {
    const buf = hessian.encode({
      $class: 'org.bson.Document',
      $: {
        _id: {
          $class: 'org.bson.Document',
          $: {
            $in: [
              '5bd6a201c816e527d97cb1ad',
            ],
          },
          isMap: true,
        },
      },
      isMap: true,
    }, '2.0');
    const output = hessian.decode(buf, '2.0', true);
    assert.deepEqual(output, {
      $class: 'org.bson.Document',
      $: {
        _id: {
          $class: 'org.bson.Document',
          $: {
            $in: [
              '5bd6a201c816e527d97cb1ad',
            ],
          },
        },
      },
    });
  });

  describe('v2', () => {
    it('should check class name', function () {
      var buf = Buffer.from('4fa5313233272d636f6e736f6c652e6c6f672831292d27906f9070692e6d6f64656c2e53756273637269626572526567526573756c749806726573756c74076d657373616765047a6f6e65066461746149640770726f66696c6504757569640a696e7374616e636549640a617474726962757465736f90544e05475a30304253006f416c697061792e416e745669702d4a617661436c69656e743a6e616d653d636f6d2e616c697061792e616e747669702e636c69656e742e696e7465726e616c2e64726d2e44726d436f6e74726f6c2e726573747261696e53747261746567792c76657273696f6e3d332e304044524d4e53002465623334346332352d333234332d343265392d396162322d3364393462646533656239354e4d7a', 'hex');
      const classCache = new Map();
      classCache.enableCompile = true;
      assert.throws(function () {
        hessian.decode(buf, '2.0', { classCache });
      }, /invalid className/);
    });

    it('should throw error if invalid id', function () {
      assert.throws(function () {
        ensureValidIdentifier('a+c');
      }, /invalid identifier\: a\+c/);
    });

    it('should write type with ref for the second time', function () {
      const encoder = hessian.encoderV2.reset();
      // writeObject
      encoder._writeObjectBegin('org.bson.Document');
      encoder.writeInt(2);
      encoder.writeString('key1');
      encoder.writeString('key2');
      encoder._writeObjectBegin('org.bson.Document');
      // writeMap key1
      encoder.byteBuffer.put(0x4d);
      encoder.writeType('org.bson.Column');
      encoder.byteBuffer.put(0x7a);
      // writeMap key2
      encoder.byteBuffer.put(0x4d);
      encoder.writeType('org.bson.Column');
      encoder.byteBuffer.put(0x7a);

      const buf = encoder.get();
      const res = hessian.decode(buf, '2.0', { withType: true });
      assert.deepEqual(res, {
        $class: 'org.bson.Document',
        $: {
          key1: {
            $class: 'org.bson.Column',
            $: {},
          },
          key2: {
            $class: 'org.bson.Column',
            $: {},
          },
        },
      });
    });
  });
});
