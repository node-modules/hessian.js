/**!
 * hessian.js - test/utils.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

const fs = require('fs');
const path = require('path');
const fixtures = path.join(__dirname, 'fixtures');

exports.bytes = function(name) {
  return fs.readFileSync(path.join(fixtures, name + '.bin'));
};

exports.string = function(name) {
  return fs.readFileSync(path.join(fixtures, name + '.txt'), 'utf8');
};
