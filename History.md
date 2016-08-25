
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
