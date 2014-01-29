hessian.js [![Build Status](https://secure.travis-ci.org/dead-horse/hessian.js.png)](http://travis-ci.org/dead-horse/hessian.js) [![Coverage Status](https://coveralls.io/repos/dead-horse/hessian.js/badge.png)](https://coveralls.io/r/dead-horse/hessian.js) [![Dependency Status](https://gemnasium.com/dead-horse/hessian.js.png)](https://gemnasium.com/dead-horse/hessian.js)
=========

[Hessian Serialization 1.0](http://hessian.caucho.com/doc/hessian-1.0-spec.xtp) written by pure JavaScript.
Support all kind of types in Java.

## Install

```
npm install hessian.js
```

## Support Types

8 primitive types:

1. raw binary data
2. boolean
3. 64-bit millisecond date
4. 64-bit double
5. 32-bit int
6. 64-bit long
7. null
8. UTF8-encoded string

3 recursive types:

1. list for lists and arrays
2. map for maps and dictionaries
3. object for objects

one special contruct:

1. ref for shared and circular object references

## Encoder

### Simple javascript type

```js
var hessian = require('hessian.js');
var encoder = new hessian.Encoder();

encoder.write(1); // int
encoder.write(1.1); // double
encoder.write(1e100); // double
encoder.write(Math.pow(2, 18)); // long
encoder.write(true); // boolean
encoder.write(null); // null
encoder.write('test'); // string

// java base types
encoder.write(hessian.java.long(3001010320)); // 3001010320L
encoder.write(hessian.java.double(100)); // double
encoder.write(hessian.java.intList([0, 1, 2])); // int[] = {0, 1, 2}

var object = {};
object.prop1 = [1, 2, 3];
object.prop2 = 'string';
object.prop3 = {key: 'value'};
object.prop4 = object;  // circular
encoder.write(object); // object
```

### Complex java type

```js
var hessian = require('hessian.js');
var encoder = new hessian.Encoder();

var long = {
  $class: 'java.lang.Long',
  $: 1
}
encoder.write(long); // long type

var testObject = {
  $class: 'com.hessian.TestObject',
  $: {
    a: 1,
    b: 'test',
    c: {$class: 'java.lang.Long', $: 123}
  }
};
encoder.write(testObject);
```

## Decoder

```js
var hessian = require('hessian.js');
var decoder = new hessian.Decoder(buf);

decoder.read(); //return what it is
decoder.readNull();
decoder.readBool();
decoder.readInt();
decoder.readLong();
decoder.readDouble();
decoder.readDate();
decoder.readObect();
decoder.readMap();
decoder.readArray();
decoder.readList();
decoder.readRef();
```

## Simple Usage

```js
var hessian = require('hessian.js');

var testObject = {
  a: 1,
  b: 'string',
  c: true,
  d: 1.1,
  e: Math.pow(2, 40),
  f: [1, 2, 3, '4', true, 5],
  g: {a: 1, b: true, c: 'string'}
};

var buf;
try {
  buf = hessian.encode(testObject);
} catch (err) {
  console.log('encode error: ', err.message);
  process.exit(1);
}

try {
  var res = hessian.decode(buf);
  // res.should.eql(testObject);
} catch (err) {
  console.log('decode error: ', err.message);
}
```

## TODO

1. more unit test, include test with other language.
2. benchmark test.
3. maybe support hessian 2.x.

[Hessian Serialization 2.0](http://hessian.caucho.com/doc/hessian-serialization.html) has 3 internal reference maps:

1. An object/list reference map.
2. An class definition reference map.
3. A type (class name) reference map.

## Authors

```
$ git summary

 project  : hessian.js
 repo age : 2 weeks ago
 commits  : 27
 active   : 6 days
 files    : 17
 authors  :
    25  dead_horse              92.6%
     2  fengmk2                 7.4%
```

## Licences
(The MIT License)

Copyright (c) 2014 dead-horse and other contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
