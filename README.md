hessian.js
=========

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/hessian.js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/hessian.js
[travis-image]: https://img.shields.io/travis/node-modules/hessian.js.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/hessian.js
[codecov-image]: https://codecov.io/github/node-modules/hessian.js/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/hessian.js?branch=master
[david-image]: https://img.shields.io/david/node-modules/hessian.js.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/hessian.js
[download-image]: https://img.shields.io/npm/dm/hessian.js.svg?style=flat-square
[download-url]: https://npmjs.org/package/hessian.js

Hessian Serialization [1.0](http://hessian.caucho.com/doc/hessian-1.0-spec.xtp) and
[2.0](http://hessian.caucho.com/doc/hessian-serialization.html) (base on version [4.0.7](http://mvnrepository.com/artifact/com.caucho/hessian/4.0.7)) written by pure JavaScript.
Support all kind of types in Java, with [high performance](benchmark/README.md).

## Install

```bash
$ npm install hessian.js
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

1. `list` for lists and arrays
2. `map` for maps and dictionaries
3. `object` for objects

one special contruct:

1. ref for shared and circular object references

Hessian 2.0 has 3 internal reference maps:

* An object/list reference map.
* An class definition reference map.
* A type (class name) reference map.

## Encoder

Tips: you can use with [js-to-java](https://github.com/node-modules/js-to-java) to help you write java class in js.

### Simple javascript type

```js
var hessian = require('hessian.js');
var java = require('js-to-java');
var encoder = new hessian.Encoder();

encoder.write(1); // int
encoder.write(1.1); // double
encoder.write(1e100); // double
encoder.write(Math.pow(2, 18)); // long
encoder.write(true); // boolean
encoder.write(null); // null
encoder.write('test'); // string

// java base types
encoder.write(java.long(3001010320)); // 3001010320L
encoder.write(java.double(100)); // double
encoder.write(java.array.int([0, 1, 2])); // int[] = {0, 1, 2}

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

### Java Generic Map

```js
// java code:
// Map<Long, Integer> map = new HashMap<Long, Integer>();
// map.put(123L, 123456);
// map.put(123456L, 123);

var hessian = require('hessian.js');
var encoder = new hessian.Encoder();

// using es6 Map
var map = new Map();
map.set({ '$class': 'java.lang.Long', '$': 123 }, 123456);
map.set({ '$class': 'java.lang.Long', '$': 123456 }, 123);

encoder.write(map); // or encoder.write({ '$class': 'java.util.HashMap', '$': map })
```

### Consistent Java type

If a type of Class contains a plurality of data, you must ensure that the number of attributes, and each instance of the order is the same!

```
// Wrong

[
  {$class: 'com.X', $: {a: 1, b: 2}},
  {$class: 'com.X', $: {b: 22, a: 11}},
  {$class: 'com.X', $: {a: 1, b: 2, c: 3}}]

// Right

[
  {$class: 'com.X', $: {a: 1, b: 2, c: 0}},
  {$class: 'com.X', $: {a: 11, b: 22, c: 0}},
  {$class: 'com.X', $: {a: 1, b: 2, c: 3}},
]

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

hessian 1.0:

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

hessian 2.0:

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
  buf = hessian.encode(testObject, '2.0');
} catch (err) {
  console.log('encode error: ', err.message);
  process.exit(1);
}

try {
  var res = hessian.decode(buf, '2.0');
  // res.should.eql(testObject);
} catch (err) {
  console.log('decode error: ', err.message);
}
```

## TODO

1. more unit test, include test with other language.
2. benchmark test.
3. ~~hessian 2.0 decode~~
3. ~~hessian 2.0 encode~~

## What's different between hassian 1.0 and 2.0?

* `R` meaning `ref` on 1.0, but `x52 ('R')` represents any non-final string chunk on 2.0

## Hessian 2.0 Serialization Grammar

```
           # starting production
top        ::= value

           # 8-bit binary data split into 64k chunks
binary     ::= x41 b1 b0 <binary-data> binary # non-final chunk
           ::= 'B' b1 b0 <binary-data>        # final chunk
           ::= [x20-x2f] <binary-data>        # binary data of
                                                 #  length 0-15
           ::= [x34-x37] <binary-data>        # binary data of
                                                 #  length 0-1023

           # boolean true/false
boolean    ::= 'T'
           ::= 'F'

           # definition for an object (compact map)
class-def  ::= 'C' string int string*

           # time in UTC encoded as 64-bit long milliseconds since
           #  epoch
date       ::= x4a b7 b6 b5 b4 b3 b2 b1 b0
           ::= x4b b3 b2 b1 b0       # minutes since epoch

           # 64-bit IEEE double
double     ::= 'D' b7 b6 b5 b4 b3 b2 b1 b0
           ::= x5b                   # 0.0
           ::= x5c                   # 1.0
           ::= x5d b0                # byte cast to double
                                     #  (-128.0 to 127.0)
           ::= x5e b1 b0             # short cast to double
           ::= x5f b3 b2 b1 b0       # 32-bit float cast to double

           # 32-bit signed integer
int        ::= 'I' b3 b2 b1 b0
           ::= [x80-xbf]             # -x10 to x3f
           ::= [xc0-xcf] b0          # -x800 to x7ff
           ::= [xd0-xd7] b1 b0       # -x40000 to x3ffff

           # list/vector
list       ::= x55 type value* 'Z'   # variable-length list
           ::= 'V' type int value*   # fixed-length list
           ::= x57 value* 'Z'        # variable-length untyped list
           ::= x58 int value*        # fixed-length untyped list
           ::= [x70-77] type value*  # fixed-length typed list
           ::= [x78-7f] value*       # fixed-length untyped list

           # 64-bit signed long integer
long       ::= 'L' b7 b6 b5 b4 b3 b2 b1 b0
           ::= [xd8-xef]             # -x08 to x0f
           ::= [xf0-xff] b0          # -x800 to x7ff
           ::= [x38-x3f] b1 b0       # -x40000 to x3ffff
           ::= x59 b3 b2 b1 b0       # 32-bit integer cast to long

           # map/object
map        ::= 'M' type (value value)* 'Z'  # key, value map pairs
           ::= 'H' (value value)* 'Z'       # untyped key, value

           # null value
null       ::= 'N'

           # Object instance
object     ::= 'O' int value*
           ::= [x60-x6f] value*

           # value reference (e.g. circular trees and graphs)
ref        ::= x51 int            # reference to nth map/list/object

           # UTF-8 encoded character string split into 64k chunks
string     ::= x52 b1 b0 <utf8-data> string  # non-final chunk
           ::= 'S' b1 b0 <utf8-data>         # string of length
                                             #  0-65535
           ::= [x00-x1f] <utf8-data>         # string of length
                                             #  0-31
           ::= [x30-x34] <utf8-data>         # string of length
                                             #  0-1023

           # map/list types for OO languages
type       ::= string                        # type name
           ::= int                           # type reference

           # main production
value      ::= null
           ::= binary
           ::= boolean
           ::= class-def value
           ::= date
           ::= double
           ::= int
           ::= list
           ::= long
           ::= map
           ::= object
           ::= ref
           ::= string
```

## Hessian 2.0 Bytecode map

Hessian 2.0 is organized as a bytecode protocol.
A Hessian reader is essentially a switch statement on the initial octet.

```
x00 - x1f    # utf-8 string length 0-32
x20 - x2f    # binary data length 0-16
x30 - x33    # utf-8 string length 0-1023
x34 - x37    # binary data length 0-1023
x38 - x3f    # three-octet compact long (-x40000 to x3ffff)
x40          # reserved (expansion/escape)
x41          # 8-bit binary data non-final chunk ('A')
x42          # 8-bit binary data final chunk ('B')
x43          # object type definition ('C')
x44          # 64-bit IEEE encoded double ('D')
x45          # reserved
x46          # boolean false ('F')
x47          # reserved
x48          # untyped map ('H')
x49          # 32-bit signed integer ('I')
x4a          # 64-bit UTC millisecond date
x4b          # 32-bit UTC minute date
x4c          # 64-bit signed long integer ('L')
x4d          # map with type ('M')
x4e          # null ('N')
x4f          # object instance ('O')
x50          # reserved
x51          # reference to map/list/object - integer ('Q')
x52          # utf-8 string non-final chunk ('R')
x53          # utf-8 string final chunk ('S')
x54          # boolean true ('T')
x55          # variable-length list/vector ('U')
x56          # fixed-length list/vector ('V')
x57          # variable-length untyped list/vector ('W')
x58          # fixed-length untyped list/vector ('X')
x59          # long encoded as 32-bit int ('Y')
x5a          # list/map terminator ('Z')
x5b          # double 0.0
x5c          # double 1.0
x5d          # double represented as byte (-128.0 to 127.0)
x5e          # double represented as short (-32768.0 to 327676.0)
x5f          # double represented as float
x60 - x6f    # object with direct type (` ... n, o)
x70 - x77    # fixed list with direct length (p, q, r, s, t, u, v, w)
x78 - x7f    # fixed untyped list with direct length (x, y, z, {, |, }, ~, .....)
x80 - xbf    # one-octet compact int (-x10 to x3f, x90 is 0)
xc0 - xcf    # two-octet compact int (-x800 to x7ff)
xd0 - xd7    # three-octet compact int (-x40000 to x3ffff)
xd8 - xef    # one-octet compact long (-x8 to xf, xe0 is 0)
xf0 - xff    # two-octet compact long (-x800 to x7ff, xf8 is 0)
```

## Licences

[MIT](LICENSE)
