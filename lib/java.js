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

