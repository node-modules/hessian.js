/*!
 * hessian.js - lib/java.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

exports.long = function long(v) {
  return {
    $class: 'long',
    $: v
  };
};

exports.double = function double(v) {
  return {
    $class: 'double',
    $: v
  };
};

exports.float = function float(v) {
  return {
    $class: 'float',
    $: v
  };
};

exports.typeList = function typeList(type, v) {
  return {
    $class: '[' + type,
    $: v
  };
};

/**
 * Serialization of a Java like: `int[] = {0, 1}`
 */
exports.intList = function intList(v) {
  return exports.typeList('int', v);
};

/**
 * Serialization of a Java like: `double[] = {0.1, 1.1}`
 */
exports.doubleList = function doubleList(v) {
  return exports.typeList('double', v);
};
