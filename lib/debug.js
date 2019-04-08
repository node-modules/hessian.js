'use strict';

const noop = () => {};

if ('DEBUG' in process.env) {
  module.exports = require('debug');
} else {
  module.exports = () => noop;
}
