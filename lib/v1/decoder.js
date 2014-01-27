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
  var date = utils.handleLong(this.byteBuffer.getLong());
  debug('read a date with milliEpoch: %d', date);
  return new Date(date);
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
  debug('start read string');
  while (label === 's') {
    debug('read string tunks');
    slength = this.byteBuffer.getUInt16();
    startPos = this.byteBuffer.position();
    while (slength--) {
      head = this.byteBuffer.get();
      l = utils.lengthOfUTF8(head);
      this.byteBuffer.skip(l - 1);
    }
    debug('get string trunk. start position: %d, byte length: %d',
      startPos, this.byteBuffer.position() - startPos);

    str = this.byteBuffer.getRawString(startPos, this.byteBuffer.position() - startPos);
    strs.push(str);
    label = this._checkLabel('readString', ['s', 'S']);
  }
  debug('read last trunk of string');
  // get the last trunk start with 'S'
  slength = this.byteBuffer.getUInt16();
  startPos = this.byteBuffer.position();
  while (slength--) {
    head = this.byteBuffer.get();
    l = utils.lengthOfUTF8(head);
    this.byteBuffer.skip(l - 1);
  }

  debug('get string last trunk. start position: %d, byte length: %d',
    startPos, this.byteBuffer.position() - startPos);
  str = this.byteBuffer.getRawString(startPos, this.byteBuffer.position() - startPos);
  strs.push(str);

  return strs.join('');
};

proto.readType = function(skip) {
  this._checkLabel('readType', 't');
  var typeLength = this.byteBuffer.getUInt16();
  if (skip) {
    this.byteBuffer.skip(typeLength);
    debug('ignore type, skip %d bytes', typeLength);
    return '';
  } else {
    var type = this.byteBuffer.readRawString(typeLength);
    debug('get type: %s', type);
    return type;
  }
};

proto.readLength = function () {
  this._checkLabel('readLength', 'l');
  var len = this.byteBuffer.getUInt();
  debug('read length: %s', len);
  return len;
};

/**
 * read an object from buffer
 * @param {Boolean} withType if need retain the type info
 * @return {Object}
 * @api public
 */
proto.readObject = function (withType) {
  this._checkLabel('readObject', 'M');
  debug('start read an object');
  var type = this.readType(!withType);

  // put object into reaResult
  var realResult =  {};
  // result is the output
  var result = realResult;

  if (withType && type) {
    result = {
      $class: type,
      $: realResult
    };
  }
  this.refMap[this.refId++] = result;

  // get
  var label = this.byteBuffer.getChar();
  var key;
  while (label !== 'z') {
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    key = this.readString();
    realResult[key] = this.read(withType);
    debug('read object prop: %s', key);
    label = this.byteBuffer.getChar();
  }
  debug('read object finish');
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
  this._checkLabel('readArray', 'V');
  debug('start read an array');

  var type = this.readType(!withType);

  var realResult = [];
  var result = realResult;

  if (withType && type) {
    result = {
      $class: type,
      $: realResult
    };
  }

  this.refMap[this.refId++] = result;

  var len = this.readLength();
  while(len--) {
    realResult.push(this.read(withType));
  }
  var endLabel = this.byteBuffer.getChar();
  assert(endLabel === 'z',
    'hessian readArray error, unexpect end label: ' + endLabel);

  debug('read array finished with a length of %d', result.length);
  return result;
};

proto.readList = proto.readArray;

proto.readRef = function () {
  this._checkLabel('readRef', 'R');
  var refId = this.byteBuffer.getInt();
  debug('read a ref with id: %d', refId);
  return this.refMap[refId];
};

/**
 * read any thing
 * @param {Boolean} withType if need retain the type info
 * @api public
 */
proto.read = function (withType) {
  var label = this.byteBuffer.getChar();

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
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    return this.readDate();
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
    return this.readObject(withType);
  case 'V':
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    return this.readArray(withType);
  case 'R':
    this.byteBuffer.position(this.byteBuffer.position() - 1);
    return this.readRef();
  default:
    throw new Error('hessian read get an unexpect label: ' + label);
  }
};

Decoder.decode = function (buf, withType) {
  return new Decoder(buf).read(withType);
};

module.exports = Decoder;
