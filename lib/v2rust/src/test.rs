use crate::*;
use std::{
    ops::Index,
    sync::{Arc, Mutex},
};
use ucs2::decode as decodeUcs2;

fn decode_hex(s: &str) -> Vec<u8> {
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16).unwrap())
        .collect()
}

/*
{
        "object": {
            "$class": "foo",
            "$": {
                "bool": true,
                "hashMap": {
                    "array": [
                        {
                            "name": "😁😁😁",
                            "extra": null,
                            "bigNumber": 11111111111,
                            "smallNumber": 1,
                            "latin1String": "hello",
                            "ucs2": "你好！",
                            "float": 1.23
                        }
                    ],
                    "bytes": Buffer.from([1, 2, 3, 4])
                }
            }
        }
    }
 */
fn complex_object() -> Vec<u8> {
    decode_hex("4d066f626a6563744f93666f6f9204626f6f6c07686173684d61706f90544d056172726179566e014d096269674e756d6265724c00000002964619c70565787472614e05666c6f6174443ff3ae147ae147ae0c6c6174696e31537472696e670568656c6c6f046e616d6506eda0bdedb881eda0bdedb881eda0bdedb8810b736d616c6c4e756d62657291047563733203e4bda0e5a5bdefbc817a7a05627974657324010203047a7a")
}

// hellohello你好
fn mixture_string() -> Vec<u8> {
    decode_hex("0c68656c6c6f68656c6c6fe4bda0e5a5bd")
}

// 😁😁😁
fn surrogate_string() -> Vec<u8> {
    decode_hex("06eda0bdedb881eda0bdedb881eda0bdedb881")
}

fn state() -> State {
    State {
        map_shape_cache: HashMap::new(),
        class_shape_cache: HashMap::new(),
        max_map_shape_cache_len: 50,
    }
}

fn output() -> (Vec<u8>, [u8; 10000], [u16; 5000]) {
    let mut o = Vec::new();
    o.resize(10000000, 0);
    (o, [0u8; 10000], [0u16; 5000])
}

impl PartialEq<ClassInfo> for ClassInfo {
    fn eq(&self, other: &ClassInfo) -> bool {
        if !(self.bytelen == other.bytelen
            && self.cache_idx == other.cache_idx
            && self.len == other.len
            && self.skip_idx.len() == other.skip_idx.len())
        {
            false
        } else {
            for idx in 0..self.skip_idx.len() {
                if self.skip_idx[idx] != other.skip_idx[idx] {
                    return false;
                }
            }
            true
        }
    }
}

#[test]
fn should_parse_shape_cache_work() {
    let (mut output, mut latin1, mut ucs2) = output();
    let object_cache = Arc::new(Mutex::new(Vec::new()));
    let map_cache = Arc::new(Mutex::new(Vec::new()));
    let mut state = state();
    for _ in 0..10 {
        from_byte_buffer(
            complex_object().as_slice(),
            OutPut::<u8>::new(output.as_mut_slice()),
            &mut state,
            0,
            &(|a: String, b: u32, is_map: bool| {
                if is_map {
                    let mut map_cache = map_cache.lock().unwrap();
                    map_cache.push(format!("{},{}", a, b));
                    (map_cache.len() - 1) as u32
                } else {
                    let mut object_cache = object_cache.lock().unwrap();
                    object_cache.push(format!("{},{}", a, b));
                    (object_cache.len() - 1) as u32
                }
            }),
            OutPut::<u8>::new(&mut latin1),
            OutPut::<u16>::new(&mut ucs2),
        );
    }
    // object_cache js端缓存应该有一个
    let object_cache = object_cache.lock().unwrap();
    assert!(object_cache.len() == 1);
    assert!(object_cache[0] == "bool,hashMap,,2");

    // object_cache rust端缓存应该有一个
    assert!(state.class_shape_cache.len() == 1);
    assert!(state.class_shape_cache.get("foo").unwrap().len() == 1);
    assert_eq!(
        *state.class_shape_cache.get("foo").unwrap()[0],
        ClassInfo {
            len: 2,
            bytelen: 13,
            skip_idx: vec![],
            cache_idx: 0,
        }
    );

    let map_cache = map_cache.lock().unwrap();
    assert!(map_cache.len() == 3);
    assert!(map_cache[0] == "bigNumber,extra,float,latin1String,name,smallNumber,ucs2,,7");
    assert!(map_cache[1] == "array,bytes,,2");
    assert!(map_cache[2] == "object,,1");
    assert!(state.map_shape_cache.len() == 3);
    assert!(
        *state
            .map_shape_cache
            .get("bigNumber,extra,float,latin1String,name,smallNumber,ucs2,")
            .unwrap()
            == 0
    );
    assert!(*state.map_shape_cache.get("array,bytes,").unwrap() == 1);
    assert!(*state.map_shape_cache.get("object,").unwrap() == 2);
}

#[test]
fn should_concat_string_work() {
    let (mut output, mut latin1, mut ucs2) = output();
    let object_cache = Arc::new(Mutex::new(Vec::new()));
    let map_cache = Arc::new(Mutex::new(Vec::new()));
    let mut state = state();
    let (latin1_len, ucs2_len) = from_byte_buffer(
        complex_object().as_slice(),
        OutPut::<u8>::new(output.as_mut_slice()),
        &mut state,
        0,
        &(|a: String, b: u32, is_map: bool| {
            if is_map {
                let mut map_cache = map_cache.lock().unwrap();
                map_cache.push(format!("{},{}", a, b));
                (map_cache.len() - 1) as u32
            } else {
                let mut object_cache = object_cache.lock().unwrap();
                object_cache.push(format!("{},{}", a, b));
                (object_cache.len() - 1) as u32
            }
        }),
        OutPut::<u8>::new(&mut latin1),
        OutPut::<u16>::new(&mut ucs2),
    );
    // latin1 string
    let latin1_string = std::str::from_utf8(latin1.index(0..latin1_len)).unwrap();
    assert!(latin1_string == "hello");

    // ucs2 string
    let mut ucs2_utf8_output = [0u8; 1000];
    let size = decodeUcs2(ucs2.index(0..ucs2_len), &mut ucs2_utf8_output).unwrap();
    let ucs2_string = std::str::from_utf8(ucs2_utf8_output.index(0..size)).unwrap();
    assert!(ucs2_string == "你好！");
}

#[test]
fn should_surrogate_string_work() {
    let (mut output, mut latin1, mut ucs2) = output();
    let object_cache = Arc::new(Mutex::new(Vec::new()));
    let map_cache = Arc::new(Mutex::new(Vec::new()));
    let mut state = state();
    let (latin1_len, ucs2_len) = from_byte_buffer(
        surrogate_string().as_slice(),
        OutPut::<u8>::new(output.as_mut_slice()),
        &mut state,
        0,
        &(|a: String, b: u32, is_map: bool| {
            if is_map {
                let mut map_cache = map_cache.lock().unwrap();
                map_cache.push(format!("{},{}", a, b));
                (map_cache.len() - 1) as u32
            } else {
                let mut object_cache = object_cache.lock().unwrap();
                object_cache.push(format!("{},{}", a, b));
                (object_cache.len() - 1) as u32
            }
        }),
        OutPut::<u8>::new(&mut latin1),
        OutPut::<u16>::new(&mut ucs2),
    );
    assert!(latin1_len == 0);
    assert!(ucs2_len == 0);
    let magic_code = LittleEndian::read_uint(output.as_slice(), 1);
    assert!(magic_code == MagicCode::Utf8SurrogateString as u64);
    let start = LittleEndian::read_u32(output.as_slice().index(1..)) as usize;
    let end = LittleEndian::read_u32(output.as_slice().index(5..)) as usize;
    assert!(start == 1);
    assert!(end == 19);
}

#[test]
fn should_map_cache_hit_work() {
    let (mut output, mut latin1, mut ucs2) = output();
    let object_cache = Arc::new(Mutex::new(Vec::new()));
    let map_cache = Arc::new(Mutex::new(Vec::new()));
    let mut state = state();
    // 执行2次后得到的ouput应该是完全命中缓存的
    for _ in 0..2 {
        from_byte_buffer(
            complex_object().as_slice(),
            OutPut::<u8>::new(output.as_mut_slice()),
            &mut state,
            0,
            &(|a: String, b: u32, is_map: bool| {
                if is_map {
                    let mut map_cache = map_cache.lock().unwrap();
                    map_cache.push(format!("{},{}", a, b));
                    (map_cache.len() - 1) as u32
                } else {
                    let mut object_cache = object_cache.lock().unwrap();
                    object_cache.push(format!("{},{}", a, b));
                    (object_cache.len() - 1) as u32
                }
            }),
            OutPut::<u8>::new(&mut latin1),
            OutPut::<u16>::new(&mut ucs2),
        );
    }
    let output = output.as_slice();
    // 最外层的是  map: object
    let magic_code = LittleEndian::read_uint(output, 1);
    assert!(magic_code == MagicCode::Map as u64);
    let type_offset = LittleEndian::read_u32(output.index(1..)) as usize;
    assert!(type_offset == 97);
    let map_type = LittleEndian::read_uint(output.index(type_offset..), 1);
    assert!(map_type == MagicCode::TypingIdx as u64);
    let cache_idx = LittleEndian::read_u32(output.index((type_offset + 1)..));

    let the_cache = state
        .map_shape_cache
        .iter()
        .find(|(_, value)| **value == cache_idx)
        .unwrap();
    assert!(the_cache.0 == "object,");
}

#[test]
fn should_object_cache_hit_work() {
    let (mut output, mut latin1, mut ucs2) = output();
    let object_cache = Arc::new(Mutex::new(Vec::new()));
    let map_cache = Arc::new(Mutex::new(Vec::new()));
    let mut state = state();
    // 执行2次后得到的ouput应该是完全命中缓存的
    for _ in 0..2 {
        from_byte_buffer(
            complex_object().as_slice(),
            OutPut::<u8>::new(output.as_mut_slice()),
            &mut state,
            0,
            &(|a: String, b: u32, is_map: bool| {
                if is_map {
                    let mut map_cache = map_cache.lock().unwrap();
                    map_cache.push(format!("{},{}", a, b));
                    (map_cache.len() - 1) as u32
                } else {
                    let mut object_cache = object_cache.lock().unwrap();
                    object_cache.push(format!("{},{}", a, b));
                    (object_cache.len() - 1) as u32
                }
            }),
            OutPut::<u8>::new(&mut latin1),
            OutPut::<u16>::new(&mut ucs2),
        );
    }
    let output = output.as_slice();
    // foo 对象
    let object_type = LittleEndian::read_uint(output.index(5..), 1);
    assert!(object_type == MagicCode::Object as u64);
    let cache_idx = LittleEndian::read_u32(output.index(6..));
    let cache = state
        .class_shape_cache
        .iter()
        .find(|(_, value)| {
            let hit = value.iter().find(|items| items.cache_idx == cache_idx);
            hit.is_some()
        })
        .unwrap();
    assert!(cache.0 == "foo");
    assert!(cache.1.len() == 1);
    assert!(
        *cache.1[0]
            == ClassInfo {
                len: 2,
                bytelen: 13,
                skip_idx: Vec::new(),
                cache_idx: 0
            }
    );
}

#[test]
fn should_simd_guess_work() {
    let mixture_string = mixture_string();
    let input = Input::from_bytes(mixture_string.as_slice());
    let used = input.lation1_bytelen_simd(0, 12);
    assert!(used == 8); // hellohello你好 有8个连续的单字节字符串
}

#[test]
fn should_skip_mixture_string_work() {
    let mixture_string = mixture_string();
    let mut input = Input::from_bytes(mixture_string.as_slice());
    input.cursor += 1;
    input.skip_utf8(12);
    let target = std::str::from_utf8(mixture_string.as_slice().index(1..input.cursor)).unwrap();
    assert!(target == "hellohello你好");
}

#[test]
fn should_read_mixture_string_work() {
    let mixture_string = mixture_string();
    let mut input = Input::from_bytes(mixture_string.as_slice());
    input.cursor += 1;
    let mut latin1 = [0u8; 1000];
    let mut ucs2 = [0u16; 1000];
    let mut latin1_output = OutPut::<u8>::new(&mut latin1);
    let mut ucs2_output = OutPut::<u16>::new(&mut ucs2);

    input.read_utf8(
        12,
        &mut OutPut::<u8>::new(&mut [0u8; 100]),
        &mut latin1_output,
        &mut ucs2_output,
    );
    let len = ucs2_output.cursor();
    assert!(latin1_output.cursor() == 0);
    assert!(len == 12);

    let mut utf8_output = [0u8; 100];
    let size = decodeUcs2(&ucs2.index(0..len), &mut utf8_output).unwrap();
    assert!(size == 16);
    let target = std::str::from_utf8(utf8_output.index(0..size)).unwrap();
    assert!(target == "hellohello你好");
}

#[test]
fn should_complex_object_ok() {
    let (mut output, mut latin1, mut ucs2) = output();
    let object_cache = Arc::new(Mutex::new(Vec::new()));
    let map_cache = Arc::new(Mutex::new(Vec::new()));
    let mut state = state();
    let (latin1_len, ucs2_len) = from_byte_buffer(
        complex_object().as_slice(),
        OutPut::<u8>::new(output.as_mut_slice()),
        &mut state,
        0,
        &(|a: String, b: u32, is_map: bool| {
            if is_map {
                let mut map_cache = map_cache.lock().unwrap();
                map_cache.push(format!("{},{}", a, b));
                (map_cache.len() - 1) as u32
            } else {
                let mut object_cache = object_cache.lock().unwrap();
                object_cache.push(format!("{},{}", a, b));
                (object_cache.len() - 1) as u32
            }
        }),
        OutPut::<u8>::new(&mut latin1),
        OutPut::<u16>::new(&mut ucs2),
    );
    assert!(std::str::from_utf8(latin1.index(0..latin1_len)).unwrap() == "hello");
    assert!(ucs2.index(0..ucs2_len) == [20320u16, 22909u16, 65281u16]); // 你好！
    let output = output.as_slice();
    assert!(output.index(0..2) == [15, 97]); // map 和 typeoffset
    assert!(output.index(2..10) == [0, 0, 0, 1, 0, 0, 0, 0]); // 对象 和 缓存索引
    assert!(output.index(10..12) == [5, 1]); // bool = true
    assert!(output.index(12..17) == [15, 80, 0, 0, 0]); // hashMap typeOffset 80
    assert!(output.index(17..22) == [2, 1, 0, 0, 0]); // array 长度 1
    assert!(output.index(22..27) == [15, 56, 0, 0, 0]); // array 里面的map typeoffset 56
    assert!(output.index(27..36) == [10, 199, 25, 70, 150, 2, 0, 0, 0,]); // bigNumber 11111111111
    assert!(output.index(36..37) == [3]); // extra null
    assert!(output.index(37..46) == [9, 174, 71, 225, 122, 20, 174, 243, 63]); // float 1.23
    assert!(output.index(46..55) == [17, 0, 0, 0, 0, 5, 0, 0, 0]); // latin1String
    assert!(output.index(55..64) == [16, 107, 0, 0, 0, 125, 0, 0, 0]); // name😁😁😁
    assert!(output.index(64..69) == [6, 1, 0, 0, 0]); // smallNumber 1
    assert!(output.index(69..78) == [4, 0, 0, 0, 0, 3, 0, 0, 0]); // "ucs2": "你好！",
    assert!(output.index(83..92) == [13, 162, 0, 0, 0, 4, 0, 0, 0]); // buffer  start len

}

#[test]
fn should_complex_object_without_cache_ok() {
    let (mut output, mut latin1, mut ucs2) = output();
    let object_cache = Arc::new(Mutex::new(Vec::new()));
    let map_cache = Arc::new(Mutex::new(Vec::new()));
    let mut state = state();
    state.max_map_shape_cache_len = 0;
    let (latin1_len, ucs2_len) = from_byte_buffer(
        complex_object().as_slice(),
        OutPut::<u8>::new(output.as_mut_slice()),
        &mut state,
        0,
        &(|a: String, b: u32, is_map: bool| {
            if is_map {
                let mut map_cache = map_cache.lock().unwrap();
                map_cache.push(format!("{},{}", a, b));
                (map_cache.len() - 1) as u32
            } else {
                let mut object_cache = object_cache.lock().unwrap();
                object_cache.push(format!("{},{}", a, b));
                (object_cache.len() - 1) as u32
            }
        }),
        OutPut::<u8>::new(&mut latin1),
        OutPut::<u16>::new(&mut ucs2),
    );
    assert!(std::str::from_utf8(latin1.index(0..latin1_len)).unwrap() == "hello");
    assert!(ucs2.index(0..ucs2_len) == [20320u16, 22909u16, 65281u16]); // 你好！
    let output = output.as_slice();
    assert!(output.index(0..2) == [15, 174]); // map 和 typeoffset
    assert!(output.index(174..175) == [7]); // 7 表示没缓存

    assert!(output.index(175..179) == [1, 0, 0, 0]); // 1 个字段
    assert!(output.index(179..183) == [7, 0, 0, 0]); // 字节长度  object,
    assert!(output.index(183..190) == [ 111, 98, 106, 101, 99, 116, 44]); // object,
    assert!(std::str::from_utf8(&[ 111, 98, 106, 101, 99, 116, 44]).unwrap() == "object,");
   
    assert!(output.index(2..10) == [0, 0, 0, 1, 0, 0, 0, 0]); // 对象 和 缓存索引
    assert!(output.index(10..12) == [5, 1]); // bool = true
    assert!(output.index(12..17) == [15, 141, 0, 0, 0]); // hashMap typeOffset 141

    assert!(output.index((141 + 12)..154) == [7]); // 7 表示没缓存
    assert!(output.index(154..158) == [2, 0, 0, 0]); // 2 个字段
    assert!(output.index(158..162) == [12, 0, 0, 0]); // 字节长度  array,bytes,
    assert!(output.index(162..174) == [ 97, 114, 114, 97, 121, 44, 98, 121, 116, 101, 115, 44 ]); // object,
    assert!(std::str::from_utf8(&[ 97, 114, 114, 97, 121, 44, 98, 121, 116, 101, 115, 44 ]).unwrap() == "array,bytes,");
   
   
    assert!(output.index(17..22) == [2, 1, 0, 0, 0]); // array 长度 1
    assert!(output.index(22..27) == [15, 56, 0, 0, 0]); // array 里面的map typeoffset 56

    
    assert!(output.index((56 + 22)..79) == [7]); // 7 表示没缓存
    assert!(output.index(79..83) == [7, 0, 0, 0]); // 7 个字段
    assert!(output.index(83..87) == [57, 0, 0, 0]); // 字节长度  array,bytes,
    assert!(output.index(87..144) == [ 98, 105, 103, 78, 117, 109, 98, 101, 114, 44, 101, 120, 116, 114, 97, 44, 102, 108, 111, 97, 116, 44, 108, 97, 116, 105, 110, 49, 83, 116, 114, 105, 110, 103, 44, 110, 97, 109, 101, 44, 115, 109, 97, 108, 108, 78, 117, 109, 98, 101, 114, 44, 117, 99, 115, 50, 44]); // object,
    assert!(std::str::from_utf8(&[ 98, 105, 103, 78, 117, 109, 98, 101, 114, 44, 101, 120, 116, 114, 97, 44, 102, 108, 111, 97, 116, 44, 108, 97, 116, 105, 110, 49, 83, 116, 114, 105, 110, 103, 44, 110, 97, 109, 101, 44, 115, 109, 97, 108, 108, 78, 117, 109, 98, 101, 114, 44, 117, 99, 115, 50, 44]).unwrap() == "bigNumber,extra,float,latin1String,name,smallNumber,ucs2,");
    assert!(output.index(27..36) == [10, 199, 25, 70, 150, 2, 0, 0, 0,]); // bigNumber 11111111111
    assert!(output.index(36..37) == [3]); // extra null
    assert!(output.index(37..46) == [9, 174, 71, 225, 122, 20, 174, 243, 63]); // float 1.23
    assert!(output.index(46..55) == [17, 0, 0, 0, 0, 5, 0, 0, 0]); // latin1String
    assert!(output.index(55..64) == [16, 107, 0, 0, 0, 125, 0, 0, 0]); // name😁😁😁
    assert!(output.index(64..69) == [6, 1, 0, 0, 0]); // smallNumber 1
    assert!(output.index(69..78) == [4, 0, 0, 0, 0, 3, 0, 0, 0]); // "ucs2": "你好！",
}
