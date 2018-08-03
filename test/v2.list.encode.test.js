'use strict';

var fs = require('fs');
var path = require('path');
var hessian = require('../');
var assert = require('assert');
var utils = require('../lib/utils');
var java = require('js-to-java');

describe('hessian v2', function () {
  it('v2 list encode should ok', function () {
    var arg = {
      "$class": "com.x.Site",
      "$": {
        "id": {
          "$class": "long",
          "$": 1637
        },
        "groupId": {
          "$class": "long",
          "$": 2
        },
        "description": {
          "$class": "java.lang.String",
          "$": ""
        },
        "name": {
          "$class": "java.lang.String",
          "$": "acltimeout1"
        },
        "url": {
          "$class": "java.lang.String",
          "$": "https://pages.x.com"
        },
        "spma": {
          "$class": "java.lang.String",
          "$": "a2279"
        },
        "extendFields": {
          "$class": "java.util.List",
          "$": [
            {
              "$class": "com.x.ExtendField",
              "$": {
                "fieldKey": {
                  "$class": "java.lang.String",
                  "$": "site-tmc"
                },
                "bizId": {
                  "$class": "long",
                  "$": 1637
                },
                "fieldValue": {
                  "$class": "java.lang.String",
                  "$": "1"
                },
                "id": {
                  "$class": "long",
                  "$": 0
                },
                "type": {
                  "$class": "int",
                  "$": 0
                },
                "status": {
                  "$class": "int",
                  "$": 0
                },
                "metaId": {
                  "$class": "long",
                  "$": 0
                },
                "valueType": null,
                "gmtCreate": null,
                "gmtModified": null
              }
            },
            {
              "$class": "com.x.ExtendField",
              "$": {
                "fieldKey": {
                  "$class": "java.lang.String",
                  "$": "site-solution"
                },
                "bizId": {
                  "$class": "long",
                  "$": 1637
                },
                "fieldValue": {
                  "$class": "java.lang.String",
                  "$": "base"
                },
                "id": {
                  "$class": "long",
                  "$": 0
                },
                "type": {
                  "$class": "int",
                  "$": 0
                },
                "status": {
                  "$class": "int",
                  "$": 0
                },
                "metaId": {
                  "$class": "long",
                  "$": 0
                },
                "valueType": null,
                "gmtCreate": null,
                "gmtModified": null
              }
            },
            {
              "$class": "com.x.ExtendField",
              "$": {
                "bizId": {
                  "$class": "long",
                  "$": 1637
                },
                "fieldKey": {
                  "$class": "java.lang.String",
                  "$": "site-template-whitelist"
                },
                "fieldValue": {
                  "$class": "java.lang.String",
                  "$": "julu"
                },
                "id": {
                  "$class": "long",
                  "$": 0
                },
                "type": {
                  "$class": "int",
                  "$": 0
                },
                "status": {
                  "$class": "int",
                  "$": 0
                },
                "metaId": {
                  "$class": "long",
                  "$": 0
                },
                "valueType": null,
                "gmtCreate": null,
                "gmtModified": null
              }
            },
            {
              "$class": "com.x.ExtendField",
              "$": {
                "bizId": {
                  "$class": "long",
                  "$": 1637
                },
                "fieldKey": {
                  "$class": "java.lang.String",
                  "$": "site-owner"
                },
                "fieldValue": {
                  "$class": "java.lang.String",
                  "$": "julu"
                },
                "id": {
                  "$class": "long",
                  "$": 0
                },
                "type": {
                  "$class": "int",
                  "$": 0
                },
                "status": {
                  "$class": "int",
                  "$": 0
                },
                "metaId": {
                  "$class": "long",
                  "$": 0
                },
                "valueType": null,
                "gmtCreate": null,
                "gmtModified": null
              }
            }
          ]
        },
        "engName": null,
        "ownerWorkIds": null,
        "status": {
          "$class": "int",
          "$": 0
        },
        "creator": null,
        "mobileUrl": null,
        "groupName": null,
        "gmtCreate": null,
        "gmtModified": null
      }
    };

    var bytes = hessian.encode(arg, '2.0');
    var rs = hessian.decode(bytes, '2.0');
    assert.deepEqual(java.revert(arg), rs);

    hessian.encoderV2.reset();
    assert(hessian.encoderV2._classRefs.length === 0);
    assert(hessian.encoderV2._typeRefs.length === 0);
    assert(Object.keys(hessian.encoderV2._classRefFields).length === 0);
  });
});
