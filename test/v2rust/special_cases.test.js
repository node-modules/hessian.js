'use strict';

const hessian = require('../../index');
const assert = require('assert');
var rustDecode = require('./rustdecoder');

describe('test/special_cases.test', function() {
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
    const output = rustDecode(buf);
    assert.deepEqual(output, {
      _id: {
        $in: [
          '5bd6a201c816e527d97cb1ad',
        ],
      },
    });
  });
});
