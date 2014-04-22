
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
