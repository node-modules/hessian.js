benchmark result
----------

```
node benchmark/encode.js

  Hessian Encode Benchmark
  node version: v0.11.12, date: Tue May 27 2014 11:30:03 GMT+0800 (CST)
  Starting...
  16 tests completed.

  hessian1 encode: number         x 1,669,884 ops/sec ±1.38% (93 runs sampled)
  hessian2 encode: number         x 1,893,674 ops/sec ±0.74% (96 runs sampled)
  hessian1 encode: date           x   834,286 ops/sec ±1.40% (91 runs sampled)
  hessian2 encode: date           x   789,740 ops/sec ±1.06% (95 runs sampled)
  hessian1 encode: long           x   646,034 ops/sec ±0.89% (95 runs sampled)
  hessian2 encode: long           x   643,354 ops/sec ±1.60% (88 runs sampled)
  hessian1 encode: string         x   955,180 ops/sec ±1.19% (96 runs sampled)
  hessian2 encode: string         x 1,006,919 ops/sec ±1.22% (93 runs sampled)
  hessian1 encode: [1, 2, 3]      x   536,860 ops/sec ±0.85% (94 runs sampled)
  hessian2 encode: [1, 2, 3]      x   615,294 ops/sec ±0.93% (95 runs sampled)
  hessian1 encode array           x   377,167 ops/sec ±0.85% (95 runs sampled)
  hessian2 encode array           x   403,383 ops/sec ±0.94% (91 runs sampled)
  hessian1 encode: simple object  x   146,367 ops/sec ±1.67% (93 runs sampled)
  hessian2 encode: simple object  x   147,188 ops/sec ±1.81% (94 runs sampled)
  hessian1 encode: complex object x    95,309 ops/sec ±1.40% (91 runs sampled)
  hessian2 encode: complex object x    95,851 ops/sec ±1.20% (96 runs sampled)


  Hessian Decode Benchmark
  node version: v0.11.12, date: Tue May 27 2014 11:31:30 GMT+0800 (CST)
  Starting...
  16 tests completed.

  hessian1 decode: number         x 5,915,496 ops/sec ±0.73% (98 runs sampled)
  hessian2 decode: number         x 5,838,371 ops/sec ±2.66% (90 runs sampled)
  hessian1 decode: date           x 2,958,136 ops/sec ±1.87% (91 runs sampled)
  hessian2 decode: date           x 2,721,653 ops/sec ±0.81% (97 runs sampled)
  hessian1 decode: long           x 4,076,127 ops/sec ±0.83% (93 runs sampled)
  hessian2 decode: long           x 5,400,659 ops/sec ±1.26% (93 runs sampled)
  hessian1 decode: string         x 1,067,996 ops/sec ±2.20% (91 runs sampled)
  hessian2 decode: string         x 1,133,082 ops/sec ±1.04% (93 runs sampled)
  hessian1 decode: [1, 2, 3]      x 1,201,908 ops/sec ±1.26% (91 runs sampled)
  hessian2 decode: [1, 2, 3]      x 1,915,498 ops/sec ±1.66% (95 runs sampled)
  hessian1 decode array           x   505,896 ops/sec ±1.13% (93 runs sampled)
  hessian2 decode array           x   616,792 ops/sec ±0.79% (98 runs sampled)
  hessian1 decode: simple object  x   194,474 ops/sec ±0.87% (97 runs sampled)
  hessian2 decode: simple object  x   177,599 ops/sec ±0.97% (96 runs sampled)
  hessian1 decode: complex object x   139,387 ops/sec ±0.83% (97 runs sampled)
  hessian2 decode: complex object x   139,213 ops/sec ±0.58% (99 runs sampled)
  ```
