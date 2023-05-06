"use strict";
/* eslint-disable no-undef */
const {
  build
} = require("../dist/index");
const { decode } = require('../../index');
const big = require("../benchmark/big");
const fs = require("fs");

const [decodeRust] = build();


fs.writeFileSync("./new.tmp", JSON.stringify(decodeRust(big), undefined, 4));
fs.writeFileSync("./old.tmp", JSON.stringify(decode(big, '2.0'), undefined, 4));
