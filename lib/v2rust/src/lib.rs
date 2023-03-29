#![feature(portable_simd)]
///Harness用来连接napi和parse，主要职责是将hessian的buffer转换成另一个类型的buffer
/// # buffer的layout如下
/// 
/// | object              | 1 byte: value = 1  | 4byte: uint32LE = cache index  |                              |                   |                               |                                  |                              |
/// |---------------------|--------------------|--------------------------------|------------------------------|-------------------|-------------------------------|----------------------------------|------------------------------|
/// | array               | 1 byte: value = 2  | 4byte: uint32LE = array length |                              |                   |                               |                                  |                              |
/// | null                | 1 byte: value = 3  |                                |                              |                   |                               |                                  |                              |
/// | ucs2string          | 1 byte: value = 4  | 4byte: uint32LE = start        | 4byte: uint32LE = end        |                   |                               |                                  |                              |
/// | bool                | 1 byte: value = 5  | 1byte: uint8 = value           |                              |                   |                               |                                  |                              |
/// | int                 | 1 byte: value = 6  | 4byte: uint32LE = value        |                              |                   |                               |                                  |                              |
/// | double              | 1 byte: value = 9  | 8byte: float64LE = value       |                              |                   |                               |                                  |                              |
/// | long                | 1 byte: value = 10 | 8byte: int64LE = value         |                              |                   |                               |                                  |                              |
/// | date                | 1 byte: value = 11 | 8byte: int64LE = value         |                              |                   |                               |                                  |                              |
/// | ref                 | 1 byte: value = 12 | 4byte: uint32LE = value        |                              |                   |                               |                                  |                              |
/// | bytes               | 1 byte: value = 13 | 4byte: uint32LE = start        | 4byte: uint32LE = end        |                   |                               |                                  |                              |
/// | chunk               | 1 byte: value = 14 | 1byte: type = string or bytes  | 4byte: uint32LE = chunk size |                   |                               |                                  |                              |
/// | map                 | 1 byte: value = 15 | 4byte: uint32LE = typeoffset   | .....bytes = values          | 1byte: uint8 = 7  | 4byte: uint32LE = fieldLength | 4byte: uint32LE = fileByteLength | .....fileByteLength = fields |
/// | map                 | 1 byte: value = 15 | 4byte: uint32LE = typeoffset   | .....bytes = values          | 1byte: uint8 = 8  | 4byte: uint32LE = cache index |                                  |                              |
/// | utf8surrogatestring | 1 byte: value = 16 | 4byte: uint32LE = start        | 4byte: uint32LE = start      |                   |                               |                                  |                              |
/// | latin1string        | 1 byte: value = 17 | 4byte: uint32LE = start        | 4byte: uint32LE = start      |                   |                               |                                  |                              |
///
/// # 关于类型一下几点需要单独说明
///   1. string 分三种 latin1string 表示v8单字节的字符串包括基础字母和标点符号；ucs2表示双字节字符串，一般是汉字；utf8surrogatestring表示带代理码点的utf8，一般是带表情符号的
///   2. chunk 用来表示bytes的chunk和string的chunk
///   3. map的typeoffset是表示map的类型在buffer中的偏移，因为map的value遍历完了以后才能得到类型，因此type在后面
///   4. map的type是7的时候表示map的缓存用完了，需要读取所有的key，可以用逗号分割。
///   5. map的type是8的时候表示map的缓存命中了，不需要读取key，直接读缓存索引即可。
/// 


use std::{collections::HashMap, ptr::slice_from_raw_parts_mut};
mod hessian;
use byteorder::{ByteOrder, LittleEndian};
use hessian::*;
use napi_derive::napi;
use std::ops::IndexMut;
#[cfg(test)]
mod test;

use napi::{bindgen_prelude::*, JsBuffer};

#[napi]
struct Harness(State);

#[allow(dead_code)]
#[napi]
impl Harness {
    ///
    /// 创建一个带State的Parser, 这里用单独的结构体Harness连接State和Parser和Napi
    /// max_map_shape_cache_len 表示最大的map缓存数量，防止map里面key的种类太多，使用过多内存
    ///
    #[napi(constructor)]
    pub fn new(max_map_shape_cache_len: u32) -> Self {
        Harness(State {
            class_shape_cache: HashMap::new(),
            map_shape_cache: HashMap::new(),
            max_map_shape_cache_len,
        })
    }

    ///
    /// 开始转化hessian的buffer
    /// input 表示hessian的buffer输入
    /// offset表示hessian在buffer中的偏移
    /// set_cache 是js回调，用来设置缓存，一般在初次反序列化没命中缓存时被调用
    /// output 是回写的buffer，用来存放parse生成的新的buffer
    /// latin1_string 是回写的buffer，用来存放 hessian里面的所有单字节字符串
    /// ucs2_string 是回写的buffer，用来存放 hessian里面所有的双字节字符串
    #[napi(catch_unwind)]
    pub fn parse<T: Fn(String, u32, bool) -> Result<u32>>(
        &mut self,
        input: JsBuffer,
        offset: u32,
        set_cache: T,
        output: JsBuffer,
        latin1_string: JsBuffer,
        ucs2_string: JsBuffer,
    ) {
        let latin1_string: &mut [u8] = &mut latin1_string.into_value().unwrap();
        let ucs2_string: &mut [u8] = &mut ucs2_string.into_value().unwrap();

        let (latin1_string_len, ucs2_string_len) = from_byte_buffer(
            &input.into_value().unwrap(),
            OutPut::<u8>::new(&mut output.into_value().unwrap()),
            &mut self.0,
            offset,
            &|fields: String, len: u32, is_map: bool| match set_cache(fields, len, is_map) {
                Ok(idx) => idx,
                Err(_) => panic!("set cache error"),
            },
            OutPut::<u8>::new(latin1_string.index_mut(4..latin1_string.len())),
            OutPut::<u16>::new(unsafe {
                &mut *slice_from_raw_parts_mut(
                    ucs2_string.as_mut_ptr().offset(4) as *mut u16,
                    (ucs2_string.len() - 4) / 2,
                )
            }),
        );
        // 将2个字符串的真实长度写入缓冲区的头部4个字节
        LittleEndian::write_u32(latin1_string, latin1_string_len as u32);
        LittleEndian::write_u32(ucs2_string, (ucs2_string_len * 2) as u32);
    }

    /// 输出一下当前的state，用来打日志，不保证性能
    #[napi(catch_unwind)]
    pub fn format_state(&self) -> String {
        format!("{:?}", *&self.0)
    }

    /// 清除缓存
    #[napi(catch_unwind)]
    pub fn drain(&mut self) -> bool {
        let state = &mut self.0;
        state.map_shape_cache.clear();
        state.class_shape_cache.clear();
        state.map_shape_cache.len() == 0 && state.class_shape_cache.len() == 0
    }

    /// 输出一下当前缓存的使用情况，以及thread_local的使用情况
    #[napi(catch_unwind)]
    pub fn usage(&mut self) -> HashMap<String, u32> {
        let state = &mut self.0;
        HashMap::from([
            (
                "map_shape_cache_size".to_string(),
                state.map_shape_cache.len() as u32,
            ),
            (
                "class_shape_cache_size".to_string(),
                state.class_shape_cache.len() as u32,
            ),
            (
                "temp_buffer_size".to_string(),
                Temp::get_mut_buffer().capacity() as u32,
            ),
            (
                "temp_definition_size".to_string(),
                Temp::get_mut_definition().capacity() as u32,
            ),
        ])
    }
}

const PKG_VERSION: &'static str = env!("CARGO_PKG_VERSION");

#[allow(dead_code)]
#[napi(catch_unwind)]
fn version() -> &'static str {
    PKG_VERSION
}
