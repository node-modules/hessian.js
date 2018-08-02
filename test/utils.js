'use strict';

var fs = require('fs');
var path = require('path');
var fixtures = path.join(__dirname, 'fixtures');

exports.bytes = function (name) {
  return fs.readFileSync(path.join(fixtures, name + '.bin'));
};

exports.string = function (name) {
  return fs.readFileSync(path.join(fixtures, name + '.txt'), 'utf8');
};
