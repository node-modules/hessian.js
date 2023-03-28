"use strict";
/**
 * 用来构建前端的parser和rust的parser
 */
const os = require("os");
const { version, Harness } = (() => {
    try {
        console.log(`trying load from ${os.arch()} ${os.platform()}`);
        if (os.platform() === 'darwin') {
            if (os.arch() === 'x64') {
                return require('./index.darwin-x64');
            }
            if (os.arch() === 'arm64') {
                return require('./index.darwin-arm64');
            }
        }
        if (os.platform() === 'linux') {
            if (os.arch() === 'x64') {
                return require('./index.linux-x64-gnu');
            }
            if (os.arch() === 'arm64') {
                return require('./index.linux-arm64-gnu');
            }
        }
        throw new Error(`unsupport platform`);
    }
    catch (error) {
        console.error(`${os.platform()}.${os.arch()}可能不受支持，请检查`);
        throw error;
    }
})();
exports.version = version;
const util = require("util");
const separator = ",";
const specKey = "^||^";
/**
 * ShapeCache 的目的是为了缓存对象的类型。
 * 比如下面2种代码：
 * exp1:
 * ```
 * const result = {}
 * result[var1] = "foo";
 * result[var2] = "bar";
 * ```
 * exp2:
 * ```
 * const result = {
 *    hello: "foo",
 *    world: "bar"
 * }
 * ```
 * exp1 中的var1和var2会带来小字符串的创建，gc需要处理更多的字符串对象。另外随着var1和var2 的变化，这两行代码会导致result的类型无法预测，v8会将result降级成hashMap模式。
 *      hashMap会导致每次插入都会计算字段的hash，以此确定result中是否存在这个字段。
 * exp2 中的result将key固定，一方面减少了字符串的生成，一方面能将result的类型固定，无论是创建result还是访问result的属性都能得到很大的性能提升
 */
class ShapeCache {
    constructor(maxMapCacheLength, onCacheOverflow) {
        this.maxMapCacheLength = maxMapCacheLength;
        this.onCacheOverflow = onCacheOverflow;
        this.objectShapeCache = [];
        this.mapShapeCache = [];
    }
    buildAnonymousObject(fields, fieldLen, utils) {
        const { setRef, read } = utils;
        const ret = {};
        setRef(ret);
        let start = 0;
        let length = 0;
        while (start < fields.length) {
            const index = fields.indexOf(',', start);
            const key = index === -1 ? fields.substring(start) : fields.substring(start, index);
            start = index + 1;
            if (key === specKey) {
                const key = read();
                if (key.name) {
                    ret[key.name] = read();
                }
                else {
                    ret[key] = read();
                }
            }
            else {
                ret[key] = read();
            }
            length++;
        }
        if (fieldLen !== length) {
            throw "对象key的hash校验失败, 请检查是否带有分隔符 ,";
        }
        return ret;
    }
    buildShape(fields, fieldLen, utils) {
        const fieldsArray = fields.split(separator).filter(Boolean);
        if (fieldsArray.length !== fieldLen) {
            throw "对象key的hash校验失败, 请检查是否有带有分隔符 ,";
        }
        if (fieldsArray.some(x => x.includes('"'))) {
            throw "key的名称不能带有引号，因为这个key会实时生成代码，防止代码注入";
        }
        const code = `
    const { read, setRef, readUInt32LE, skip} = utils;
    return function Record() {
      const result = {
        ${fieldsArray.filter(x => x !== specKey).map((x) => `"${x}": null,`).join("")}
      };
      setRef(result);
      var temp;
      var key;
      ${fieldsArray
                .map((x, y) => {
                    if (x === specKey) {
                        return `
              key = read();
              if (key.name) {
                result[key.name] = read();
              } else {
                result[key] = read();
              }
            `;
                    }
                    return `
          temp = read();
          if (temp !== null) {
            result["${x}"] = temp;
          }
          `;
                })
                .join("")}
        return result;
    }
      `;
        /* jshint ignore:start */
        return new Function('utils', code)(utils);
        /* jshint ignore:end */
    }
    isCacheOverflow() {
        return this.mapShapeCache.length >= this.maxMapCacheLength;
    }
    reportCacheOverflow() {
        if (this.onCacheOverflow) {
            this.onCacheOverflow(this.mapShapeCache.length);
        }
    }
    clear() {
        this.objectShapeCache = [];
        this.mapShapeCache = [];
    }
    getCache() {
        return {
            object: this.objectShapeCache,
            map: this.mapShapeCache,
        };
    }
    setCache(fileds, fieldsLen, isMap, utils) {
        const func = this.buildShape(fileds, fieldsLen, utils);
        if (isMap) {
            this.mapShapeCache.push(func);
            if (this.isCacheOverflow()) {
                this.reportCacheOverflow();
            }
            return this.mapShapeCache.length - 1;
        }
        else {
            this.objectShapeCache.push(func);
            return this.objectShapeCache.length - 1;
        }
    }
    withObjectCache(cacheIdx) {
        return this.objectShapeCache[cacheIdx]();
    }
    withMapCache(cacheIdx, fields, fieldLen, utils) {
        // 有缓存id的时候
        if (cacheIdx !== null) {
            if (this.mapShapeCache[cacheIdx]) {
                return this.mapShapeCache[cacheIdx]();
            }
            else {
                throw "cache must have value";
            }
        }
        if (fields === null || fieldLen === null) {
            throw "At least one of fields and cacheIdx";
        }
        return this.buildAnonymousObject(fields, fieldLen, utils);
    }
}
function JavaExceptionError(obj) {
    Error.call(this);
    Error.captureStackTrace(this, JavaExceptionError);
    let undeclaredThrowable = obj.undeclaredThrowable;
    let detailMessage = obj.detailMessage;
    let cause = obj.cause;
    if (undeclaredThrowable && undeclaredThrowable instanceof Error) {
        if (!obj.detailMessage) {
            return undeclaredThrowable;
        }
        this.name = undeclaredThrowable.name;
        this.message = obj.detailMessage + "; " + undeclaredThrowable.message;
    }
    else if (!detailMessage && cause && cause !== obj.$) {
        return cause;
    }
    else {
        this.message = obj.detailMessage || obj.$class;
        if (obj.reasonAndSolution) {
            this.message += "; reasonAndSolution: " + obj.reasonAndSolution;
        }
        this.name = "unknow";
    }
    Object.defineProperty(this, "cause", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: obj.cause,
    });
    let stack = this.name + ": " + this.message;
    let stackTraces = obj.stackTrace || [];
    for (let i = 0; i < stackTraces.length; i++) {
        let trace = stackTraces[i];
        stack +=
            "\n    at " +
            trace.declaringClass +
            "." +
            trace.methodName +
            " (" +
            trace.fileName +
            ":" +
            trace.lineNumber +
            ")";
    }
    this.stack = stack;
}
util.inherits(JavaExceptionError, Error);
/**
 * start 之所以设计成高阶函数是为了固定住里面声明的函数的地址，这样通过 new Function 生成缓存的时候就可以将确定的函数地址传到代码，利于v8的inline。
 * start 返回一个大的闭包，使用闭包是因为闭包作用域在词法分析阶段就能确定，而使用对象比如 start.read 则需要v8 LoadIC 来确认start有没有变化，因此闭包不需要警惕object带来的多态问题, 用起来比较简单
 */
const start = (shapeCache) => {
    let input;
    let outputBuffer;
    let cursor = 0;
    let latin1String = '';
    let ucs2String = '';
    let output;
    let refPool = [];
    function skip(l) {
        cursor += l;
    }
    function checkException(obj) {
        if (obj &&
            obj.hasOwnProperty("detailMessage") &&
            obj.hasOwnProperty("stackTrace")) {
            return new JavaExceptionError(obj);
        }
        return obj;
    }
    function readUInt32LE(cursor) {
        return output.getUint32(cursor, true);
    }
    function readInt32LE(cursor) {
        return output.getInt32(cursor, true);
    }
    function readInt64LE(cursor) {
        return output.getBigInt64(cursor, true);
    }
    function readF64LE(cursor) {
        return output.getFloat64(cursor, true);
    }
    function outputAt(cursor) {
        return output.getUint8(cursor);
    }
    function outputStringAt(start, len) {
        return outputBuffer.utf8Slice(start, len + start);
    }
    function setRef(obj) {
        refPool.push(obj);
    }
    function readObject() {
        const cacheIdx = readUInt32LE(cursor);
        cursor = cursor + 4;
        const ret = shapeCache.withObjectCache(cacheIdx);
        return checkException(ret);
    }
    function readMap() {
        const typeOffset = cursor + readUInt32LE(cursor) - 1;
        let typeCategory = outputAt(typeOffset);
        let fields = null;
        let fieldLen = null;
        let cacheIdx = null;
        let endCursor = 0;
        if (typeCategory === 7) {
            fieldLen = readUInt32LE(typeOffset + 1);
            const len = readUInt32LE(typeOffset + 5);
            fields = outputStringAt(typeOffset + 9, len);
            endCursor = typeOffset + 9 + len;
        }
        else if (typeCategory === 8) {
            cacheIdx = readUInt32LE(typeOffset + 1);
            endCursor = typeOffset + 5;
        }
        else {
            throw "need type";
        }
        cursor = cursor + 4;
        const ret = shapeCache.withMapCache(cacheIdx, fields, fieldLen, shapeCacheUtils);
        cursor = endCursor;
        return checkException(ret);
    }
    function readBool() {
        const len = outputAt(cursor);
        const ret = len !== 0;
        cursor = cursor + 1;
        return ret;
    }
    function readLatin1String() {
        const start = readUInt32LE(cursor);
        const end = readUInt32LE(cursor + 4);
        const ret = latin1String.substring(start, end);
        cursor = cursor + 8;
        return ret;
    }
    function readUcs2String() {
        const start = readUInt32LE(cursor);
        const end = readUInt32LE(cursor + 4);
        const ret = ucs2String.substring(start, end);
        cursor = cursor + 8;
        return ret;
    }
    function readUtf8SurrogateString() {
        const start = readUInt32LE(cursor);
        const end = readUInt32LE(cursor + 4);
        const data = [];
        {
            let cursor = start;
            while (cursor < end) {
                var ch = input[cursor];
                if (ch < 0x80) {
                    data.push(ch);
                    cursor = cursor + 1;
                }
                else if ((ch & 0xe0) === 0xc0) {
                    const ch1 = input[cursor + 1];
                    data.push(((ch & 0x1f) << 6) + (ch1 & 0x3f));
                    cursor = cursor + 2;
                }
                else if ((ch & 0xf0) === 0xe0) {
                    const ch1 = input[cursor + 1];
                    const ch2 = input[cursor + 2];
                    data.push(((ch & 0x0f) << 12) + ((ch1 & 0x3f) << 6) + (ch2 & 0x3f));
                    cursor = cursor + 3;
                }
                else {
                    throw new Error('string is not valid UTF-8 encode');
                }
            }
        }
        const ret = String.fromCharCode.apply(String, data);
        cursor = cursor + 8;
        return ret;
    }
    function readArray() {
        const len = readUInt32LE(cursor);
        const elements = new Array(len);
        cursor = cursor + 4;
        refPool.push(elements);
        for (let index = 0; index < len; index++) {
            elements[index] = read();
        }
        return elements;
    }
    function readInt() {
        const ret = readInt32LE(cursor);
        cursor = cursor + 4;
        return ret;
    }
    function readLong() {
        const ret = Number(readInt64LE(cursor));
        cursor = cursor + 8;
        return ret;
    }
    function readDouble() {
        const ret = parseFloat(readF64LE(cursor));
        cursor = cursor + 8;
        return ret;
    }
    function readDate() {
        const ret = new Date(Number(readInt64LE(cursor)));
        cursor = cursor + 8;
        return ret;
    }
    function readRef() {
        const refId = readInt32LE(cursor);
        cursor = cursor + 4;
        return refPool[refId];
    }
    function readBytes() {
        const start = readUInt32LE(cursor);
        const len = readUInt32LE(cursor + 4);
        cursor = cursor + 8;
        return Buffer.from(input.slice(start, start + len));
    }
    function readChunk() {
        const type = outputAt(cursor); // 类型，1是byte, 2是字符串
        const len = readUInt32LE(cursor + 1); // chunk长度
        cursor = cursor + 5;
        if (len === 1) {
            return read();
        }
        if (type === 1) {
            const bfs = new Array(len);
            for (let index = 0; index < len; index++) {
                bfs[index] = read();
            }
            return Buffer.concat(bfs);
        }
        else if (type === 2) {
            const strs = new Array(len);
            for (let index = 0; index < len; index++) {
                strs[index] = read();
            }
            return strs.join("");
        }
        else {
            throw "error chunk type";
        }
    }
    function read() {
        switch (outputAt(cursor++)) {
            case 17: //latin1String
                return readLatin1String();
            case 3: // null
                return null;
            case 6: // number
                return readInt();
            case 1: // object
                return readObject();
            case 4: // string
                return readUcs2String();
            case 2: // array
                return readArray();
            case 15: //map
                return readMap();
            case 5: // bool
                return readBool();
            case 9: // double,
                return readDouble();
            case 10: // long,
                return readLong();
            case 11: //date
                return readDate();
            case 12: //ref
                return readRef();
            case 13: //bytes
                return readBytes();
            case 14: //chunk
                return readChunk();
            case 16: //utf8surrogate
                return readUtf8SurrogateString();
            default:
                throw `unkonw type at ${cursor}`;
        }
    }
    const shapeCacheUtils = {
        read,
        readUInt32LE: () => {
            const result = readUInt32LE(cursor);
            cursor += 4;
            return result;
        },
        setRef,
        skip
    };
    return {
        setState(params) {
            cursor = 0;
            input = params.input;
            outputBuffer = params.outputBuffer;
            output = new DataView(outputBuffer.buffer);
            latin1String = params.latin1String;
            ucs2String = params.ucs2String;
            refPool = [];
            return {
                read,
                readObject,
            };
        },
        setCache: (fields, len, isMap) => {
            return shapeCache.setCache(fields, len, isMap, shapeCacheUtils);
        }
    };
};
const defaultShareBuffer = (() => {
    let v = null;
    return () => {
        if (!v) {
            v = Buffer.allocUnsafe(5242880); // 默认5M
        }
        return v;
    };
})();
/**
 * 所有字符串缓冲区。
 * 之所以需要所有字符串缓存区是为了避免v8频繁创建字符串，比如通过 Buffer.latin1Slice 生成字符串，首先会经历一次js world ->  c++ world 的转变，然后做一次memcopy
 * 如果所有的字符串都在这个字符串池里面，那么我们通过 String.substring 就可以快速得到这个字符串了，不用离开js world。另外 js 的字符串有很多种引用类型，substring 并不会真的创建字符串，而是在原有的字符串基础上生成一个v8::internal::SlicedString
 */
const defaultLatin1Buffer = (() => {
    let v = null;
    return () => {
        if (!v) {
            v = Buffer.allocUnsafe(5242880); // 默认5M
        }
        return v;
    };
})();
const defaultUcs2Buffer = (() => {
    let v = null;
    return () => {
        if (!v) {
            v = Buffer.allocUnsafe(5242880); // 默认5M
        }
        return v;
    };
})();
// 初始化一个parser
function build(config) {
    const maxU32 = Math.pow(2, 31) - 1;
    const { maxCacheLength: maxMapCacheLength = 20, shareBuffer, onCacheOverflow, } = config || {};
    if (typeof maxMapCacheLength !== "number") {
        throw "maxCacheLength must be number";
    }
    if (maxMapCacheLength > maxU32) {
        throw "最大长度为32位无符号整形最大值";
    }
    // rust 输出的buffer
    const outputBuffer = shareBuffer || defaultShareBuffer();
    // 初始化一个前端的缓存
    const shapeCache = new ShapeCache(maxMapCacheLength, onCacheOverflow); // objectshape 的缓存，索引和rust的缓存对应
    // rust 带state的parser
    const harness = new Harness(parseInt(maxMapCacheLength));
    // rust 输出的单字节字符串，buffer里面的所有单字节字符串都在里面
    const outputLatin1Buffer = defaultLatin1Buffer();
    // rust 输出的双字节字符串，buffer里面的所有双字符串都在里面
    const outputUcs2Buffer = defaultUcs2Buffer();
    // dump缓冲，用来打日志，排查问题
    const dump = () => {
        return {
            rustShapeCache: harness.formatState(),
            objectShapeCache: shapeCache.getCache().object.map(x => x && x.toString() || null),
            mapShapeCache: shapeCache.getCache().map.map(x => x && x.toString() || null),
        };
    };
    // 初始化一个前端的parser，用来parse rust输出的buffer
    const { setState, setCache } = start(shapeCache);
    return {
        preset: (input, offset = 0) => {
            if (typeof offset !== "number") {
                throw "offset must be number";
            }
            if (offset > maxU32) {
                throw "最大offset为32位无符号整形最大值";
            }
            if (input.length > maxU32) {
                throw "input最大长度为32位无符号整形最大值";
            }
            if (input.length - offset > (outputBuffer.byteLength * 3) / 5) {
                throw `input太长了，达到了outputBufferLength: ${outputBuffer.byteLength}的3/5，可能会产生意想不到的结果，出于安全考虑抛出此异常，请精简返回结果，或加大输出buffer的size`;
            }
            harness.parse(input, parseInt(offset), setCache, outputBuffer, outputLatin1Buffer, outputUcs2Buffer);
            const latin1String = outputLatin1Buffer.latin1Slice(4, outputLatin1Buffer.readUInt32LE() + 4);
            const ucs2String = outputUcs2Buffer.ucs2Slice(4, outputUcs2Buffer.readUInt32LE() + 4);
            return setState({ input, outputBuffer, latin1String, ucs2String });
        },
        dump,
        // drain the cache
        drain: () => {
            shapeCache.clear();
            harness.drain();
        },
        // usage
        usage: () => {
            const cache = shapeCache.getCache();
            return {
                jsUsage: {
                    map: cache.map.length,
                    object: cache.object.length,
                },
                rustUsage: harness.usage(),
            };
        },
    };
}
exports.build = build;
