'use strict';

var assert = require('assert');

var handlers = {};

function deregisterDecodeHandler(className) {
	delete handlers[className];
}

function registerDecodeHandler(className, handler) {
  assert(typeof handler === 'function', 'handler should be a function');
  handlers[className] = handler;
}

function handle(result, withType) {
  var className = result.$class;
  var handler = handlers[className];

  if (handler) {
    result = handler(result);
  }
  return withType ? result : result.$;
}

exports.handle = handle;
exports.registerDecodeHandler = registerDecodeHandler;
exports.deregisterDecodeHandler = deregisterDecodeHandler;
