use crate::*;

pub fn decode_hex(s: &str) -> Vec<u8> {
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16).unwrap())
        .collect()
}

#[test]
fn main() {
    let bytes = decode_hex("4d01619101744f93666f6f9101736f90937a");

    let mut o = Vec::new();
    o.resize(10000000, 0);
    let mut lc = State {
        map_shape_cache: HashMap::new(),
        class_shape_cache: HashMap::new(),
        max_map_shape_cache_len: 50,
    };
    println!("{}", bytes.len());
    for _ in 0..1 {
        from_byte_buffer(
            bytes.as_slice(),
            OutPut::<u8>::new(o.as_mut_slice()),
            &mut lc,
            0,
            &(|a: String, b: u32, is_map: bool| {
                1
            }),
            OutPut::<u8>::new(&mut [0u8;10000]),
            OutPut::<u16>::new(&mut [0u16;10000]),
        );
    }
    println!("success")
}
