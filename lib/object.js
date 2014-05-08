/**!
 * hessian.js - lib/object.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

var util = require('util');

exports.DEFAULT_CLASSNAME = {
  boolean: 'boolean',
  int: 'int',
  long: 'long',
  double: 'double',
  date: 'java.util.Date',
  string: 'java.lang.String',
  byteArray: '[B',
  list: 'java.util.ArrayList',
  map: 'java.util.HashMap',
  exception: 'java.lang.RuntimeException'
};

exports.Object = 'java.lang.Object';

var SERIALIZER_MAP = exports.SERIALIZER_MAP = {};

[
  'boolean',
  'java.lang.Boolean',
  'bool',
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Bool';
});

[
  'double',
  'java.lang.Double',
  'float',
  'java.lang.Float',
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Double';
});

[
  'java.lang.Long',
  'long',
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Long';
});

[
  'short',
  'java.lang.Short',
  'int',
  'java.lang.Integer',
  'byte',
  'java.lang.Byte',
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Int';
});

[
  'java.lang.String',
  'String',
  'string',
  'char',
  'char[]',
  'java.lang.Character',
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'String';
});

[
  'java.util.Date'
].forEach(function (t) {
  SERIALIZER_MAP[t] = 'Date';
});

// http://www.devthought.com/2011/12/22/a-string-is-not-an-error/
function JavaExceptionError(obj) {
  Error.call(this);
  // Error.captureStackTrace(this, arguments.callee);

  // $: { detailMessage: 'this is a java IOException instance',
  // cause: [Circular],
  // stackTrace:
  //  [ { declaringClass: 'hessian.Main',
  //      methodName: 'main',
  //      fileName: 'Main.java',
  //      lineNumber: 1282 } ] }

  if (obj.$.undeclaredThrowable instanceof Error) {
    if (!obj.$.detailMessage) {
      return obj.$.undeclaredThrowable;
    }
    this.name = obj.$.undeclaredThrowable.name;
    this.message = obj.$.detailMessage + '; ' + obj.$.undeclaredThrowable.message;
  } else if (!obj.$.detailMessage) {
  //   xxx.HSFException { '$class': 'xxxx.HSFException',
  // '$':
  //  { reasonAndSolution: '',
  //    hsfExceptionDesc: null,
  //    detailMessage: null,
  //    cause:
  //     { [xxxx.RemotingException:
    return obj.$.cause;
  } else {
    this.message = obj.$.detailMessage;
    if (obj.$.reasonAndSolution) {
      this.message += '; reasonAndSolution: ' + obj.$.reasonAndSolution;
    }
    this.name = obj.$class;
  }

  var stack = this.name + ': ' + this.message;
  var stackTraces = obj.$.stackTrace || [];
  for (var i = 0; i < stackTraces.length; i++) {
    var trace = stackTraces[i];
    stack += '\n    at ' + trace.declaringClass + '.' + trace.methodName
      + ' (' + trace.fileName + ':' + trace.lineNumber + ')';
  }

  this.stack = stack;
}

util.inherits(JavaExceptionError, Error);

exports.JavaExceptionError = JavaExceptionError;
