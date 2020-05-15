
2.10.0 / 2020-05-15
==================

**features**
  * [[`461a715`](http://github.com/node-modules/hessian.js/commit/461a71551503d6f6430f9b078ffd2be4f7624de4)] - feat: support encode & decode custom map type (#122) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

2.9.0 / 2019-05-15
==================

**features**
  * [[`ee57e93`](http://github.com/node-modules/hessian.js/commit/ee57e93e580dd4a595cf1098a4f35febfbc6a990)] - feat: support custom decode handler (#119) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

**fixes**
  * [[`3f0b392`](http://github.com/node-modules/hessian.js/commit/3f0b392c58a9b5e65915eca55bc209439ba1e3db)] - fix: should reset _classRefFields (#87) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`f71da69`](http://github.com/node-modules/hessian.js/commit/f71da690266f1fb65e6a569ee417996001ded8f1)] - test: fix throws test on node 10 (#110) (fengmk2 <<fengmk2@gmail.com>>)

2.8.1 / 2018-01-18
==================

**fixes**
  * [[`b231db0`](http://github.com/dead-horse/hessian.js/commit/b231db01af9379936bd810762a1a0bb1f37cd59c)] - fix: compose cache key with class and fields length (#102) (Yiyu He <<dead_horse@qq.com>>)

2.8.0 / 2018-01-10
==================

**features**
  * [[`ce5a7f8`](http://github.com/node-modules/hessian.js/commit/ce5a7f81fb65285f04619d3131872b2325dd92b0)] - feat: support convert java.util.Locale to com.caucho.hessian.io.LocaleHandle (#99) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

2.7.0 / 2017-12-26
==================

**features**
  * [[`ceaef7b`](http://github.com/dead-horse/hessian.js/commit/ceaef7b169772ad8edb07a5839d830c4789eee1e)] - feat: hessian2 optimize codec (#97) (Hongcai Deng <<admin@dhchouse.com>>)

2.6.0 / 2017-11-16
==================

**features**
  * [[`1403a44`](http://github.com/dead-horse/hessian.js/commit/1403a445db7982f35c2b557f13411a9ced4b83e1)] - feat: use byte.getRawStringByStringLength to read utf8 string (#94) (Yiyu He <<dead_horse@qq.com>>)

**fixes**
  * [[`a7a3f92`](http://github.com/dead-horse/hessian.js/commit/a7a3f9276bc2d5f2bd48006850694b494285c3a4)] - fix: support writeLong parameter is a Long object (#96) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

2.5.0 / 2017-11-01
==================

**features**
  * [[`4d3b48e`](http://github.com/dead-horse/hessian.js/commit/4d3b48e6e5ed06dca54f2c1dffeb092628b80fbd)] - feat: support cache class for v2/decode (#90) (Yiyu He <<dead_horse@qq.com>>)

2.4.0 / 2017-08-02
==================

**features**
  * [[`ab45730`](http://github.com/node-modules/hessian.js/commit/ab457306e0ab6ac28eaa0e93b3478bcb1fbf5108)] - feat: upgrade is-type-of to 1.1.0 (#81) (fengmk2 <<fengmk2@gmail.com>>)

2.3.1 / 2017-07-25
==================

  * fix: skip regExp & Function property (#77)

2.3.0 / 2017-07-25
==================

  * feat: map key is object should try to use `name` propery (#78)

2.2.2 / 2017-07-13
==================

  * fix: package.json to reduce vulnerabilities (#75)

2.2.1 / 2016-08-25
==================

  * fix: downward compatibility (#71)

2.2.0 / 2016-08-24
==================

  * feat: support java.util.HashMap to es6 Map (#70)

2.1.9 / 2016-08-24
==================

  * fix(writeDate): overflow 32-bit signed integer issue

2.1.8 / 2016-04-03
==================

  * deps: upgrade all deps

2.1.7 / 2016-04-01
==================

  * fix: remove es6
  * chore: add examples for test
  * fix: v2 list encode

2.1.6 / 2016-03-10
==================

  * lint: remove deprecated rule "globastrict", replace with rule "strict:global"
  * fix: donnot use the api of module long introduced in new version, module byte depends on the old version.
  * fix: output Number.MAX_SAFE_INTEGER as string rather than number. fix #56

2.1.5 / 2016-02-03
==================

  * fix: fix encode/decode date bug

2.1.4 / 2015-10-12
==================

  * fix: HashMap & Map is same type

2.1.3 / 2015-10-01
==================

 * test: use npm scripts instead of Makefile
 * test: add undefined test
 * fix: array encode can be null

2.1.2 / 2015-09-10
==================

 * fix: skip innerClass ref field like this$\d

2.1.1 / 2015-09-06
==================

  * fix(writeLong) hessian2.0 write long bug

2.1.0 / 2015-08-27
==================

 * test(testcase) fix testcase
 * chore(README) modify README
 * feat(generic) support generic map

2.0.0 / 2015-07-05
==================

 * feat(hessian 2.0) implement hessian 2.0

1.0.4 / 2015-04-09
==================

 * test: add more node version on travis ci
 * test: add encode {$class: "java.lang.Long", $: null} => null test case
 * fix(encode) fix object property null issue

1.0.3 / 2015-03-11
==================

  * fix(decode): toString is not stable.
  * chore(test): skip large string with v0.11.15
  * fix(writeObject): should assertType obj.$ when writeObject and add more messge
  * ignore 0xd800 and 0xdbff char test cases

1.0.2 / 2015-01-29
==================

 * feat(null): writeNull when obj.$ is null

1.0.1 / 2014-08-27
==================

  * Merge pull request #30 from node-modules/java.lang.Error
  * support decode java.lang.*Error as js Error

1.0.0 / 2014-08-27
==================

  * bump byte

0.5.2 / 2014-08-20
==================

  * Merge pull request #29 from node-modules/exception-bug-fix
  * only test on node 0.10.28
  * change badge and add travis coverage
  * fix exception convert bug
  * support `java.util.concurrent.atomic.AtomicLong` fix #27

0.5.1 / 2014-06-25
==================

  * default list and map withType

0.5.0 / 2014-06-25
==================

  * Merge pull request #26 from node-modules/full-with-type
  * withType return all type info for v1
  * add bencmark result link

0.4.2 / 2014-05-15
==================

  * Merge pull request #24 from node-modules/support-Long
  * support encode Long instance

0.4.1 / 2014-05-15
==================

  * Merge pull request #23 from node-modules/cache-class-name
  * cache class name

0.4.0 / 2014-05-13
==================

 * reuse encoder and add base benchmark
 * fix read object missing with type

0.3.1 / 2014-05-08
==================

 * handle xxxx.HSFException
 * Decode java exception object to js Error object. close #18
 * hessian 2.0 should read hessian 1.0 date format
 * add utf8 test cases

0.3.0 / 2014-04-28
==================

 * hessian 2.0 can decode hessian 1.0 list
 * hessian 2.0 can read hessian 1.0 hashmap
 * hessian 2.0 can decode hessian 1.0 int format
 * hessian 2.0 can decode hessian 1.0 long format
 * fix hessian 2.0 long decode and encode
 * add hessian 1.0 enum, list, map bin test
 * encode string as java hessian 1.0 impl
 * add number bin test

0.2.1 / 2014-04-24
==================

 * fix writeObject 2.0, now Enum as a normal java Object
 * improve enum write in hessian 2.0

0.2.0 / 2014-04-23
==================

 * hessian 2.0 refator
 * refactor readArray
 * encode and decode enum
 * refactor writeObject, writeRef, writeDate
 * refactor hessian writeObject with real java codes

0.1.11 / 2014-04-22
==================

  * bump byte

0.1.10 / 2014-04-22
==================

  * fix write array error

0.1.9 / 2014-04-22
==================

  * fix btypebuffer

0.1.8 / 2014-04-22
==================

  * support java.lang.Object

0.1.7 / 2014-04-06
==================

  * support response with int key

0.1.6 / 2014-04-04
==================

  * fix type?

0.1.5 / 2014-04-04
==================

  * fix encode array bug

0.1.4 / 2014-04-03
==================

  * fix no length read array in v1
  * use is-type-of

0.1.3 / 2014-04-01
==================

  * fix test in 0.11

0.1.2 / 2014-03-20
==================

  * remove exports.java, just let people use js-to-java module

0.1.1 / 2014-03-13
==================

  * Merge pull request #11 from dead-horse/use-is-type-of
  * use is-type-of to do type check
  * use badge replace install code

0.1.0 / 2014-02-14
==================

  * Merge pull request #9 from fengmk2/hessian-v2
  * encode hessian 2.0 list
  * encode hessian 2.0 map
  * add readRefId() to share code logic between v1.0 and v2.0
  * change decoder switch and if else to hash map code detect
  * add hessian 2.0 decoder
  * Support hessian 2.0 encoder.
  * Support hessian 2.0 decode. #8
  * fix test

0.0.3 / 2014-02-12
==================

  * add decoder.position method
  * update dependencies
  * fix encode long, read end of buffer
  * add npm badge

0.0.2 / 2014-01-30
==================

  * update readme
  * Merge pull request #6 from fengmk2/compact-types
  * fix hasOwnProperty was override: `{hasOwnProperty: 1}`
  * add type list examples: int[] = {0, 1, 2}
  * Support decode sparse array, @see http://hessian.caucho.com/doc/hessian-1.0-spec.xtp#map fixed #5
  * support anonymous variable-length list = {0, "foobar"}
  * add binary, date, double, int, list, long, string test cases on hessian 1.0.2
  * add java base types and each type mapping one test file.
  * update readme
  * Merge pull request #1 from fengmk2/more-tests
  * add readArray error test case
  * Add more tests and remove assert use TypeError instead.
  * change name to hessian.js
  * remove utility
  * fix typo
  * add AUTHORS

0.0.1 / 2014-01-27
==================

  * update readme
  * add npmignore
  * complete all the unit test
  * use get instead of read in readString
  * add todo
  * add mocha-lcov-reporter
  * add fixture.dat
  * add fixture.dat
  * add travis
  * add test
  * add test for simple type
  * update readme
  * add v1 decoder
  * add readme
  * fully support simple and complex js object to hessian
  * v1 encoder simple type done
  * update byte
  * use byte to handle the buffer things
  * Initial commit
