# benchmark result

## Node.js v22

```bash
node benchmark/encode.js

  Hessian Encode Benchmark
  node version: v22.2.0, date: Fri May 24 2024 13:52:49 GMT+0800 (中国标准时间)
  Starting...
  16 tests completed.

  hessian1 encode: number         x 10,554,236 ops/sec ±0.37% (93 runs sampled)
  hessian2 encode: number         x 10,119,997 ops/sec ±0.41% (97 runs sampled)
  hessian1 encode: date           x  5,193,957 ops/sec ±1.77% (94 runs sampled)
  hessian2 encode: date           x  4,876,796 ops/sec ±0.33% (98 runs sampled)
  hessian1 encode: long           x  2,980,923 ops/sec ±2.48% (92 runs sampled)
  hessian2 encode: long           x  3,139,771 ops/sec ±1.68% (99 runs sampled)
  hessian1 encode: string         x  5,669,817 ops/sec ±0.24% (97 runs sampled)
  hessian2 encode: string         x  5,727,011 ops/sec ±1.36% (95 runs sampled)
  hessian1 encode: [1, 2, 3]      x  3,732,383 ops/sec ±0.22% (98 runs sampled)
  hessian2 encode: [1, 2, 3]      x  4,939,881 ops/sec ±0.88% (97 runs sampled)
  hessian1 encode array           x  2,651,986 ops/sec ±3.28% (93 runs sampled)
  hessian2 encode array           x  3,385,830 ops/sec ±2.00% (93 runs sampled)
  hessian1 encode: simple object  x    853,545 ops/sec ±1.84% (91 runs sampled)
  hessian2 encode: simple object  x    700,040 ops/sec ±1.97% (94 runs sampled)
  hessian1 encode: complex object x    528,378 ops/sec ±0.64% (94 runs sampled)
  hessian2 encode: complex object x    370,348 ops/sec ±3.26% (89 runs sampled)

node benchmark/decode.js

  Hessian Decode Benchmark
  node version: v22.2.0, date: Fri May 24 2024 14:02:32 GMT+0800 (中国标准时间)
  Starting...
  43 tests completed.

  hessian1 decode: number                   x 24,540,871 ops/sec ±2.50% (90 runs sampled)
  hessian2 decode: number                   x 27,356,290 ops/sec ±0.94% (96 runs sampled)
  hessian2Rust decode: number               x  3,077,722 ops/sec ±1.65% (98 runs sampled)
  hessian1 decode: date                     x  9,668,136 ops/sec ±0.39% (99 runs sampled)
  hessian2 decode: date                     x 10,680,207 ops/sec ±0.67% (95 runs sampled)
  hessian2Rust decode: date                 x  2,694,485 ops/sec ±1.78% (98 runs sampled)
  hessian1 decode: long                     x 18,085,628 ops/sec ±0.64% (95 runs sampled)
  hessian2 decode: long                     x 22,022,242 ops/sec ±2.59% (91 runs sampled)
  hessian2Rust decode: long                 x  3,084,618 ops/sec ±1.64% (96 runs sampled)
  hessian1 decode: string                   x  6,401,052 ops/sec ±0.28% (98 runs sampled)
  hessian2 decode: string                   x  6,792,350 ops/sec ±2.05% (93 runs sampled)
  hessian2Rust decode: string               x  2,966,870 ops/sec ±0.42% (99 runs sampled)
  hessian1 decode: big string               x    699,627 ops/sec ±0.41% (101 runs sampled)
  hessian2 decode: big string               x    698,909 ops/sec ±1.70% (99 runs sampled)
  hessian2Rust decode: big string           x  2,135,147 ops/sec ±1.74% (97 runs sampled)
  hessian1 decode: [1, 2, 3]                x  3,554,109 ops/sec ±2.46% (98 runs sampled)
  hessian2 decode: [1, 2, 3]                x  2,910,527 ops/sec ±0.29% (95 runs sampled)
  hessian2Rust decode: [1, 2, 3]            x  2,692,313 ops/sec ±0.49% (101 runs sampled)
  hessian1 decode array                     x  2,180,612 ops/sec ±3.91% (87 runs sampled)
  hessian2 decode array                     x  1,951,631 ops/sec ±1.40% (98 runs sampled)
  hessian2Rust decode: array                x  2,262,801 ops/sec ±3.33% (97 runs sampled)
  hessian1 decode: simple object            x    625,004 ops/sec ±2.32% (96 runs sampled)
  hessian2 decode: simple object            x    893,804 ops/sec ±2.95% (94 runs sampled)
  hessian2Rust decode: simple object        x  1,839,489 ops/sec ±2.49% (88 runs sampled)
  hessian1 decode: complex object           x    221,339 ops/sec ±0.64% (98 runs sampled)
  hessian2 decode: complex object           x    214,527 ops/sec ±2.07% (95 runs sampled)
  hessian2Rust decode: complex object       x    948,581 ops/sec ±3.15% (94 runs sampled)
  hessian1 decode with type: number         x 15,554,965 ops/sec ±6.16% (88 runs sampled)
  hessian2 decode with type: number         x 21,231,192 ops/sec ±5.09% (88 runs sampled)
  hessian1 decode with type: date           x  9,253,355 ops/sec ±2.75% (99 runs sampled)
  hessian2 decode with type: date           x  9,216,938 ops/sec ±1.56% (94 runs sampled)
  hessian1 decode with type: long           x 14,444,300 ops/sec ±5.22% (89 runs sampled)
  hessian2 decode with type: long           x 18,387,719 ops/sec ±1.79% (95 runs sampled)
  hessian1 decode with type: string         x  5,992,505 ops/sec ±2.58% (96 runs sampled)
  hessian2 decode with type: string         x  6,541,498 ops/sec ±3.37% (92 runs sampled)
  hessian1 decode with type: [1, 2, 3]      x  3,244,874 ops/sec ±1.94% (98 runs sampled)
  hessian2 decode with type: [1, 2, 3]      x  2,634,191 ops/sec ±2.76% (97 runs sampled)
  hessian1 decode with type array           x  2,185,654 ops/sec ±0.56% (100 runs sampled)
  hessian2 decode with type array           x  1,939,382 ops/sec ±1.42% (100 runs sampled)
  hessian1 decode with type: simple object  x    621,216 ops/sec ±1.28% (98 runs sampled)
  hessian2 decode with type: simple object  x    632,073 ops/sec ±6.58% (88 runs sampled)
  hessian1 decode with type: complex object x    199,833 ops/sec ±4.69% (92 runs sampled)
  hessian2 decode with type: complex object x    216,281 ops/sec ±1.97% (95 runs sampled)
```

## Node.js v20

```bash
node benchmark/encode.js

  Hessian Encode Benchmark
  node version: v20.13.1, date: Fri May 24 2024 13:55:48 GMT+0800 (中国标准时间)
  Starting...
  16 tests completed.

  hessian1 encode: number         x 8,226,045 ops/sec ±2.40% (95 runs sampled)
  hessian2 encode: number         x 8,218,262 ops/sec ±0.45% (98 runs sampled)
  hessian1 encode: date           x 4,565,281 ops/sec ±1.51% (99 runs sampled)
  hessian2 encode: date           x 4,310,345 ops/sec ±0.47% (97 runs sampled)
  hessian1 encode: long           x 2,723,516 ops/sec ±4.46% (95 runs sampled)
  hessian2 encode: long           x 2,846,924 ops/sec ±2.39% (97 runs sampled)
  hessian1 encode: string         x 5,151,812 ops/sec ±0.80% (96 runs sampled)
  hessian2 encode: string         x 4,731,159 ops/sec ±2.99% (95 runs sampled)
  hessian1 encode: [1, 2, 3]      x 3,869,170 ops/sec ±1.76% (94 runs sampled)
  hessian2 encode: [1, 2, 3]      x 4,534,955 ops/sec ±0.50% (99 runs sampled)
  hessian1 encode array           x 2,587,918 ops/sec ±2.35% (90 runs sampled)
  hessian2 encode array           x 2,728,079 ops/sec ±5.56% (82 runs sampled)
  hessian1 encode: simple object  x   900,016 ops/sec ±1.76% (97 runs sampled)
  hessian2 encode: simple object  x   661,227 ops/sec ±0.85% (93 runs sampled)
  hessian1 encode: complex object x   525,927 ops/sec ±1.73% (94 runs sampled)
  hessian2 encode: complex object x   361,606 ops/sec ±1.95% (97 runs sampled)

node benchmark/decode.js

  Hessian Decode Benchmark
  node version: v20.13.1, date: Fri May 24 2024 13:57:47 GMT+0800 (中国标准时间)
  Starting...
  43 tests completed.

  hessian1 decode: number                   x 32,416,495 ops/sec ±1.18% (94 runs sampled)
  hessian2 decode: number                   x 25,832,730 ops/sec ±1.90% (95 runs sampled)
  hessian2Rust decode: number               x  2,768,621 ops/sec ±1.57% (95 runs sampled)
  hessian1 decode: date                     x 10,137,457 ops/sec ±0.49% (99 runs sampled)
  hessian2 decode: date                     x  8,578,054 ops/sec ±0.77% (95 runs sampled)
  hessian2Rust decode: date                 x  2,531,389 ops/sec ±1.76% (98 runs sampled)
  hessian1 decode: long                     x 16,355,409 ops/sec ±3.09% (89 runs sampled)
  hessian2 decode: long                     x 20,265,271 ops/sec ±0.38% (98 runs sampled)
  hessian2Rust decode: long                 x  2,786,180 ops/sec ±2.66% (96 runs sampled)
  hessian1 decode: string                   x  6,208,129 ops/sec ±0.89% (94 runs sampled)
  hessian2 decode: string                   x  5,739,177 ops/sec ±3.80% (96 runs sampled)
  hessian2Rust decode: string               x  2,759,285 ops/sec ±0.35% (98 runs sampled)
  hessian1 decode: big string               x    613,086 ops/sec ±0.24% (100 runs sampled)
  hessian2 decode: big string               x    604,938 ops/sec ±1.81% (90 runs sampled)
  hessian2Rust decode: big string           x  2,054,952 ops/sec ±1.92% (97 runs sampled)
  hessian1 decode: [1, 2, 3]                x  3,801,102 ops/sec ±0.35% (100 runs sampled)
  hessian2 decode: [1, 2, 3]                x  2,730,022 ops/sec ±4.94% (95 runs sampled)
  hessian2Rust decode: [1, 2, 3]            x  2,515,488 ops/sec ±1.01% (97 runs sampled)
  hessian1 decode array                     x  2,299,841 ops/sec ±1.70% (97 runs sampled)
  hessian2 decode array                     x  1,845,252 ops/sec ±0.27% (98 runs sampled)
  hessian2Rust decode: array                x  2,240,111 ops/sec ±0.23% (100 runs sampled)
  hessian1 decode: simple object            x    625,217 ops/sec ±1.74% (98 runs sampled)
  hessian2 decode: simple object            x    802,609 ops/sec ±2.56% (93 runs sampled)
  hessian2Rust decode: simple object        x  1,752,187 ops/sec ±1.97% (96 runs sampled)
  hessian1 decode: complex object           x    213,708 ops/sec ±0.47% (98 runs sampled)
  hessian2 decode: complex object           x    213,818 ops/sec ±0.23% (98 runs sampled)
  hessian2Rust decode: complex object       x    939,202 ops/sec ±1.66% (100 runs sampled)
  hessian1 decode with type: number         x 17,512,197 ops/sec ±5.49% (90 runs sampled)
  hessian2 decode with type: number         x 20,193,259 ops/sec ±1.02% (98 runs sampled)
  hessian1 decode with type: date           x  8,217,014 ops/sec ±3.32% (95 runs sampled)
  hessian2 decode with type: date           x  7,980,575 ops/sec ±0.28% (98 runs sampled)
  hessian1 decode with type: long           x 14,233,917 ops/sec ±1.78% (99 runs sampled)
  hessian2 decode with type: long           x 16,366,688 ops/sec ±0.47% (97 runs sampled)
  hessian1 decode with type: string         x  5,777,330 ops/sec ±0.58% (98 runs sampled)
  hessian2 decode with type: string         x  5,875,199 ops/sec ±1.02% (99 runs sampled)
  hessian1 decode with type: [1, 2, 3]      x  3,444,434 ops/sec ±0.59% (94 runs sampled)
  hessian2 decode with type: [1, 2, 3]      x  2,562,302 ops/sec ±2.46% (99 runs sampled)
  hessian1 decode with type array           x  2,132,214 ops/sec ±2.47% (95 runs sampled)
  hessian2 decode with type array           x  1,733,859 ops/sec ±7.67% (91 runs sampled)
  hessian1 decode with type: simple object  x    614,079 ops/sec ±1.75% (96 runs sampled)
  hessian2 decode with type: simple object  x    651,032 ops/sec ±0.49% (96 runs sampled)
  hessian1 decode with type: complex object x    208,839 ops/sec ±1.04% (96 runs sampled)
  hessian2 decode with type: complex object x    209,027 ops/sec ±2.12% (99 runs sampled)
```

## Node.js v18

```bash
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

node benchmark/decode.js

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
