benchmark result
----------

```
node benchmark/encode.js

  Hessian Encode Benchmark
  node version: v18.9.0, date: Tue Apr 11 2023 10:37:42 GMT+0800 (中国标准时间)
  Starting...
  16 tests completed.

  hessian1 encode: number         x 2,808,127 ops/sec ±0.83% (92 runs sampled)
  hessian2 encode: number         x 2,614,067 ops/sec ±0.18% (93 runs sampled)
  hessian1 encode: date           x 1,450,912 ops/sec ±0.78% (84 runs sampled)
  hessian2 encode: date           x 1,546,939 ops/sec ±0.23% (96 runs sampled)
  hessian1 encode: long           x 1,823,059 ops/sec ±0.34% (94 runs sampled)
  hessian2 encode: long           x 1,707,564 ops/sec ±0.53% (92 runs sampled)
  hessian1 encode: string         x 1,726,101 ops/sec ±0.49% (88 runs sampled)
  hessian2 encode: string         x 1,741,965 ops/sec ±1.61% (95 runs sampled)
  hessian1 encode: [1, 2, 3]      x 1,413,425 ops/sec ±0.23% (96 runs sampled)
  hessian2 encode: [1, 2, 3]      x 1,657,651 ops/sec ±1.14% (89 runs sampled)
  hessian1 encode array           x 1,050,898 ops/sec ±0.16% (98 runs sampled)
  hessian2 encode array           x 1,173,285 ops/sec ±0.21% (95 runs sampled)
  hessian1 encode: simple object  x   387,224 ops/sec ±0.91% (90 runs sampled)
  hessian2 encode: simple object  x   412,280 ops/sec ±0.86% (94 runs sampled)
  hessian1 encode: complex object x   258,920 ops/sec ±0.97% (88 runs sampled)
  hessian2 encode: complex object x   228,646 ops/sec ±2.54% (83 runs sampled)


  Hessian Decode Benchmark
  node version: v18.9.0, date: Tue Apr 11 2023 10:39:10 GMT+0800 (中国标准时间)
  Starting...
  43 tests completed.

  hessian1 decode: number                   x 16,809,715 ops/sec ±3.42% (85 runs sampled)
  hessian2 decode: number                   x 10,914,073 ops/sec ±0.63% (86 runs sampled)
  hessian2Rust decode: number               x  1,208,445 ops/sec ±0.97% (85 runs sampled)
  hessian1 decode: date                     x  4,251,577 ops/sec ±0.34% (94 runs sampled)
  hessian2 decode: date                     x  4,144,047 ops/sec ±0.74% (92 runs sampled)
  hessian2Rust decode: date                 x    886,101 ops/sec ±0.49% (92 runs sampled)
  hessian1 decode: long                     x  7,504,132 ops/sec ±0.40% (94 runs sampled)
  hessian2 decode: long                     x 10,414,329 ops/sec ±0.35% (92 runs sampled)
  hessian2Rust decode: long                 x  1,113,489 ops/sec ±0.60% (95 runs sampled)
  hessian1 decode: string                   x  2,648,959 ops/sec ±0.36% (95 runs sampled)
  hessian2 decode: string                   x  2,568,938 ops/sec ±0.39% (94 runs sampled)
  hessian2Rust decode: string               x  1,063,287 ops/sec ±0.49% (96 runs sampled)
  hessian1 decode: big string               x    270,460 ops/sec ±0.36% (92 runs sampled)
  hessian2 decode: big string               x    307,352 ops/sec ±0.29% (96 runs sampled)
  hessian2Rust decode: big string           x  1,076,869 ops/sec ±0.45% (94 runs sampled)
  hessian1 decode: [1, 2, 3]                x  1,804,364 ops/sec ±0.60% (95 runs sampled)
  hessian2 decode: [1, 2, 3]                x  2,241,320 ops/sec ±0.36% (91 runs sampled)
  hessian2Rust decode: [1, 2, 3]            x  1,027,497 ops/sec ±0.65% (86 runs sampled)
  hessian1 decode array                     x  1,054,900 ops/sec ±0.33% (96 runs sampled)
  hessian2 decode array                     x  1,199,812 ops/sec ±0.40% (95 runs sampled)
  hessian2Rust decode: array                x    841,726 ops/sec ±0.47% (91 runs sampled)
  hessian1 decode: simple object            x    376,151 ops/sec ±0.28% (94 runs sampled)
  hessian2 decode: simple object            x    542,131 ops/sec ±0.34% (90 runs sampled)
  hessian2Rust decode: simple object        x    758,986 ops/sec ±0.25% (95 runs sampled)
  hessian1 decode: complex object           x    148,108 ops/sec ±0.68% (94 runs sampled)
  hessian2 decode: complex object           x    155,768 ops/sec ±0.59% (92 runs sampled)
  hessian2Rust decode: complex object       x    397,446 ops/sec ±0.59% (94 runs sampled)
  ```
