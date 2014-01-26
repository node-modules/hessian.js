/**!
 * hessian.js - lib/v1/decoder.js
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   dead_horse <dead_horse@qq.com> (http://deadhorse.me)
 */

var assert = require('assert');
var ByteBuffer = require('byte');
var utility = require('utility');
var debug = require('debug')('hessian:v1:decoder');
var utils = require('../utils');

var Decoder = function (buf) {
  this.byteBuffer = new ByteBuffer({
    array: buf
  });
  this.refMap = {};
  this.refId = 0;
};

/**
 * prototype of Decoder
 */
var proto = Decoder.prototype;

/**
 * init from a buffer
 * @param {Buffer} buf
 * @api public
 */
proto.init = function (buf) {
  this.byteBuffer = ByteBuffer.wrap(buf);
  return this;
};

/**
 * clean the decoder
 * @api public
 */
proto.clean = function () {
  this.byteBuffer = new ByteBuffer();
  this.refMap = {};
  this.refId = 0;
  return this;
};

/**
 * check if the label match the method
 * @api private
 */
proto._checkLabel = function (method, label) {
  var l = this.byteBuffer.getChar();
  var labelIsOk = l === label || label.indexOf(l) >= 0;
  assert(labelIsOk, 'hessian ' + method + ' only accept label `' + label +
  '` but get unexpect label `' + l + '`');
  return l;
};

/**
 * read a null from buffer
 * @return {Null}
 * @api public
 */
proto.readNull = function () {
  this._checkLabel('readNull', 'N');
  return null;
};

/**
 * read a boolean from buffer
 * @return {Boolean}
 * @api public
 */
proto.readBool = function () {
  var label = this._checkLabel('readBool', ['T', 'F']);
  return label === 'T';
};

/**
 * read a int from buffer
 * @return {Number}
 * @api public
 */
proto.readInt = function () {
  this._checkLabel('readInt', 'I');
  return this.byteBuffer.getInt();
};

/**
 * read a long from buffer
 * @return {Number}
 * @api public
 */
proto.readLong = function () {
  this._checkLabel('readLong', 'L');
  return utils.handleLong(this.byteBuffer.getLong());
};

/**
 * read a double from buffer
 * @return {Number}
 * @api public
 */
proto.readDouble = function () {
  this._checkLabel('readDouble', 'D');
  return this.byteBuffer.getDouble();
};

/**
 * read a date from buffer
 * @return {Date}
 * @api public
 */
proto.readDate = function () {
  this._checkLabel('readDate', 'd');
  return new Date(utils.handleLong(this.byteBuffer.getLong()));
};

/**
 * read bytes from buffer
 * @return {Buffer}
 * @api public
 */
proto.readBytes = function () {
  var label = this._checkLabel('readBytes', ['b', 'B']);
  var bufs = [];
  var length = 0;
  // get all trunk start with 'b'
  while (label === 'b') {
    length = this.byteBuffer.getUInt16();
    bufs.push(this.byteBuffer.read(length));
    label = this._checkLabel('readBytes', ['b', 'B']);
  }
  // get the last trunk start with 'B'
  length = this.byteBuffer.getUInt16();
  bufs.push(this.byteBuffer.read(length));

  return Buffer.concat(bufs);
};

/**
 * read a string from buffer
 * @return {String}
 * @api public
 */
proto.readString = function () {
  var label = this._checkLabel('readString', ['s', 'S']);
  var strs = [];

  var slength = 0;
  var startPos = 0;
  var head;
  var l;
  var str;

  // get all trunk start with 's'

  while (label === 's') {
    slength = this.byteBuffer.getUInt16();
    startPos = this.byteBuffer.position();
    while (slength--) {
      head = this.byteBuffer.read(1)[0];
      l = utils.lengthOfUTF8(head);
      this.byteBuffer.skip(l - 1);
    }
    debug('get string trunk. start position: %d, byte length: %d',
      startPos, this.byteBuffer.position() - startPos);

    str = this.byteBuffer.getRawString(startPos, this.byteBuffer.position() - startPos);
    strs.push(str);
    label = this._checkLabel('readString', ['s', 'S']);
  }

  // get the last trunk start with 'S'
  slength = this.byteBuffer.getUInt16();
  startPos = this.byteBuffer.position();
  while (slength--) {
    head = this.byteBuffer.read(1)[0];
    l = utils.lengthOfUTF8(head);
    this.byteBuffer.skip(l - 1);
  }

  debug('get string last trunk. start position: %d, byte length: %d',
    startPos, this.byteBuffer.position() - startPos);
  str = this.byteBuffer.getRawString(startPos, this.byteBuffer.position() - startPos);
  strs.push(str);

  return strs.join('');
};

/**
 * read an object from buffer
 * @param {Boolean} withType if need retain the type info
 * @return {Object}
 * @api public
 */
proto.readObject = function (withType) {
  this._checkLabel('readObject', 'M');
  this._checkLabel('readType', 't');
  var typeLength = this.byteBuffer.getUInt16();
  var type;

  // handle type
  if (!withType) {
    this.byteBuffer.skip(typeLength);
  } else {
    type = this.byteBuffer.readRowString(typeLength);
  }

  var result = {};
  var refIndex = this.refIndex++;

  // get
  var label = this.byteBuffer.getChar();
  while (label !== 'z') {
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    result[this.readString()] = this.read(withType);
    label = this.byteBuffer.getChar();
  }

  if (withType) {
    result = {
      $class: type,
      $: result
    };
  }

  // set the ref
  this.refMap[refIndex] = result;

  return result;
};

proto.readMap = proto.readObject;

/**
 * read an array from buffer
 * @param {Boolean} withType if need retain the type info
 * @return {Array}
 * @api public
 */
proto.readArray = function (withType) {
  this._checkArray('readArray', 'V');
  this._checkLabel('readType', 't');
  var typeLength = this.byteBuffer.getUInt16();
  var type = '';

  // handle type
  if (!withType) {
    this.byteBuffer.skip(typeLength);
  } else {
    type = this.byteBuffer.readRowString(typeLength);
  }

  var result = [];
  var refIndex = this.refIndex++;

  var label = this.byteBuffer.getChar();
  while (label !== 'z') {
    result.push(this.read(withType, label));
  }

  if (withType) {
    result = {
      $class: type,
      $: result
    };
  }

  this.refMap[refIndex] = result;
  return result;
};

proto.readList = proto.readArray;

proto.readRef = function () {
  this._checkLabel('readRef', 'R');
  var refId = this.byteBuffer.getInt();
  return this.refMap[refId];
};

/**
 * read any thing
 * @param {Boolean} withType if need retain the type info
 * @param {String} label
 * @api public
 */
proto.read = function (withType, label) {
  if (typeof withType === 'string') {
    label = withType;
    withType = false;
  }
  label = label || this.byteBuffer.getChar();

  switch (label) {
  case 'N':
    return null;
  case 'T':
    return true;
  case 'F':
    return false;
  case 'I':
    return this.byteBuffer.getInt();
  case 'L':
    return utils.handleLong(this.byteBuffer.getLong());
  case 'D':
    return this.byteBuffer.getDouble();
  case 'd':
    return new Date(this.byteBuffer.getDouble());
  case 'S':
  case 's':
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    return this.readString();
  case 'B':
  case 'b':
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    return this.readBytes();
  case 'M':
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    return this.readObject();
  case 'V':
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    return this.readArray();
  case 'R':
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    return this.readRef();
  default:
    throw new Error('hessian read get an unexpect label: %s', label);
  }
};

module.exports = Decoder;
