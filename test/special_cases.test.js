'use strict';

const hessian = require('../');
const assert = require('assert');

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
});
