/**
 * hessian.js - lib/object.js
 * Copyright(c)
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
  // iList: 'java.util.List',
  map: 'java.util.HashMap',
  iMap: 'java.util.Map',
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
function JavaExceptionError(obj, withType) {
  Error.call(this);
  Error.captureStackTrace(this, JavaExceptionError);

  // $: { detailMessage: 'this is a java IOException instance',
  // cause: [Circular],
  // stackTrace:
  //  [ { declaringClass: 'hessian.Main',
  //      methodName: 'main',
  //      fileName: 'Main.java',
  //      lineNumber: 1282 } ] }
  var undeclaredThrowable = obj.$.undeclaredThrowable;
  if (undeclaredThrowable && withType) {
    undeclaredThrowable = undeclaredThrowable.$;
  }
  var detailMessage = obj.$.detailMessage;
  if (detailMessage && withType) {
    detailMessage = detailMessage.$;
  }

  var cause = obj.$.cause;
  if (cause && cause.$ && withType) {
    cause = cause.$;
  }

  if (undeclaredThrowable && undeclaredThrowable instanceof Error) {
    if (!obj.$.detailMessage) {
      return undeclaredThrowable;
    }
    this.name = undeclaredThrowable.name;
    if (withType) {
      this.message = obj.$.detailMessage.$ + '; ' + undeclaredThrowable.message;
    } else {
      this.message = obj.$.detailMessage + '; ' + undeclaredThrowable.message;
    }
  } else if (!detailMessage && cause && cause !== obj.$) {
    return cause;
  } else {
    if (withType) {
      this.message = obj.$.detailMessage && obj.$.detailMessage.$ || obj.$class;
      if (obj.$.reasonAndSolution) {
        this.message += '; reasonAndSolution: ' + obj.$.reasonAndSolution.$;
      }
    } else {
      this.message = obj.$.detailMessage || obj.$class;
      if (obj.$.reasonAndSolution) {
        this.message += '; reasonAndSolution: ' + obj.$.reasonAndSolution;
      }
    }
    this.name = obj.$class;
  }

  this.cause = obj.$.cause;

  var stack = this.name + ': ' + this.message;
  if (withType) {
    var stackTraces = obj.$.stackTrace && obj.$.stackTrace.$ || [];
    for (var i = 0; i < stackTraces.length; i++) {
      var trace = stackTraces[i].$;
      stack += '\n    at ' + (trace.declaringClass && trace.declaringClass.$)
        + '.' + (trace.methodName && trace.methodName.$)
        + ' (' + (trace.fileName && trace.fileName.$)
        + ':' + (trace.lineNumber && trace.lineNumber.$) + ')';
    }
  } else {
    var stackTraces = obj.$.stackTrace || [];
    for (var i = 0; i < stackTraces.length; i++) {
      var trace = stackTraces[i];
      stack += '\n    at ' + trace.declaringClass + '.' + trace.methodName
        + ' (' + trace.fileName + ':' + trace.lineNumber + ')';
    }
  }

  this.stack = stack;
}

util.inherits(JavaExceptionError, Error);

exports.JavaExceptionError = JavaExceptionError;
