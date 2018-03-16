'use strict';

var assert = require('assert');
var hessian = require('../');

describe('test/inner_class.test.js', function() {
  var buf = new Buffer('4F9654657374564F940773756363657373096572726F72436F64650C6572726F724D657373616765046C6973746F90544E4E566E024F9C54657374564F24496E6E657292026964067468697324306F91033132334A006F91033332314A007A', 'hex');

  it('should decode inner class and without $this prop', function() {
    var r = hessian.decode(buf, '2.0');
    assert.deepEqual(r, {
      success: true,
      errorCode: null,
      errorMessage: null,
      list: [{ id: '123' }, { id: '321' }]
    });

    var classCache = new Map();
    classCache.enableCompile = true;
    r = hessian.decode(buf, '2.0', { classCache: classCache });
    assert.deepEqual(r, {
      success: true,
      errorCode: null,
      errorMessage: null,
      list: [{ id: '123' }, { id: '321' }]
    });
  });
});
