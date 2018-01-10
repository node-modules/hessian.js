'use strict';

module.exports = function(obj) {
  return {
    $class: 'com.caucho.hessian.io.LocaleHandle',
    $: { value: obj.$ },
  };
};
