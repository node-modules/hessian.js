
1.8.4 / 2018-08-30
==================

**fixes**
  * [[`a529d50`](http://github.com/node-modules/hessian.js/commit/a529d50ae86adf94cc2a5b557c6c9caa79ec8fe5)] - fix: make cause unenumerable (#111) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.8.3 / 2018-07-20
==================

**fixes**
  * [[`954ae4a`](http://github.com/node-modules/hessian.js/commit/954ae4af214fbadbd13feb5ae6dab7637ec87fd4)] - fix: change exception detect logic (#107) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.8.2 / 2018-05-21
==================

**fixes**
  * [[`2a67803`](http://github.com/node-modules/hessian.js/commit/2a678034c1509a43b5a6fee5a3e81b8dfe1bd200)] - fix: change the way to check a type whether a exception (#106) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.8.1 / 2018-03-16
==================

**fixes**
  * [[`f93916c`](http://github.com/node-modules/hessian.js/commit/f93916c96ba65125cc070b776fbbe599ab844476)] - fix: decode inner class issue (#104) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.8.0 / 2018-02-02
==================

**others**
  * [[`e17d20f`](http://github.com/node-modules/hessian.js/commit/e17d20f1727b196247b55efc668d3ccd50aa033e)] - refactor: enhance decode class performance with pre-compile + cache (#103) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.7.1 / 2018-01-18
==================

**fixes**
  * [[`69c9ef5`](http://github.com/dead-horse/hessian.js/commit/69c9ef5bbe870ee7612ed60ffc6dce6c49dbc0b0)] - fix: compose cache key with class and fields length (#102) (Yiyu He <<dead_horse@qq.com>>)

1.7.0 / 2018-01-10
==================

**features**
  * [[`093b895`](http://github.com/node-modules/hessian.js/commit/093b895e386e342426238ec46282d089983fc503)] - feat: support convert java.util.Locale to com.caucho.hessian.io.LocaleHandle (#98) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.6.0 / 2017-11-16
==================

**features**
  * [[`002b6d8`](http://github.com/dead-horse/hessian.js/commit/002b6d8d45cc803eb084345d5fb0c7b1457fba7f)] - feat: use byte.getRawStringByStringLength to read utf8 string (Yiyu He <<dead_horse@qq.com>>)

**fixes**
  * [[`d2e6d77`](http://github.com/dead-horse/hessian.js/commit/d2e6d770e7ffffea3ba77d3d4d9f3d8635ffaad1)] - fix: support writeLong parameter is a Long object (#93) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.5.0 / 2017-11-01
==================

**features**
  * [[`b0523bd`](http://github.com/dead-horse/hessian.js/commit/b0523bd6255338aef89b027efd43fa1bf9b09089)] - feat: support cache class for v2/decode (#89) (Yiyu He <<dead_horse@qq.com>>)

1.4.2 / 2017-10-18
==================

**fixes**
  * [[`c64f4d9`](http://github.com/node-modules/hessian.js/commit/c64f4d9e9f4fa994fa26bc2d5f4bda8e3c9e542b)] - fix: keep same class fields sort (#86) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`5b384e2`](http://github.com/node-modules/hessian.js/commit/5b384e2d3a54ea72ae35dba3ea6a1a7090c72fd6)] - test: fix long test case (#88) (Yiyu He <<dead_horse@qq.com>>)

1.4.1 / 2017-08-16
==================

  * fix(writeLong) hessian2.0 write long bug (#84)

1.4.0 / 2017-08-02
==================

**features**
  * [[`976b170`](http://github.com/node-modules/hessian.js/commit/976b170cd9da4ac31124ad44407fbdd05475b5df)] - feat: upgrade is-type-of to 1.1.0 (#80) (fengmk2 <<fengmk2@gmail.com>>)

1.3.0 / 2017-07-25
==================

  * feat: map key enum object should try to use `name` property (#79)
  * fix: skip regExp & Function property (#76)
  * chore: fix npm download image

1.2.1 / 2016-04-03
==================

  * deps: upgrade all deps

1.2.0 / 2016-04-03
==================

  * feat: rename package name

1.1.3 / 2016-03-29
==================

  * fix: v2decode error

1.1.2 / 2015-11-09
==================

  * fix: pick from 2.x inner class this$\d decode error

1.1.1 / 2015-11-01
==================

  * fix: hashmap tag should be 0x4d

1.1.0 / 2015-10-31
==================

 * test: disable timeout of mocha in string.test because large file processing in node4 takes too long
 * chore: update .travis.yml
 * feat: decode map with type
 * feat: decode double with type
 * feat: decode long with type
 * chore: add publish tag

1.0.5 / 2015-10-28
==================

 * fix: array can be null & es6 Map

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
