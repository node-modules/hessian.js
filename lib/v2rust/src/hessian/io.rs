use super::*;
use byteorder::{BigEndian, ByteOrder, LittleEndian};
use std::io::Write;
use std::ops::{Index, IndexMut};
use std::simd::{Simd, SimdPartialOrd};

pub struct OutPut<'a, T> {
    data: &'a mut [T],
    cursor: usize,
    flag: bool,
}

// 将2个u32连接成一个u64, 减少cpu io的次数，频率较高的可以用这个办法加强一点性能
macro_rules! conjunct_u32_to_u64 {
    ($start: expr, $end: expr) => {
        (($end as u64) << 32) | ($start as u64)
    };
}

// 用来回写u8到buffer
impl<'a> OutPut<'a, u8> {
    pub fn new(v: &'a mut [u8]) -> Self {
        OutPut {
            data: v,
            cursor: 0,
            flag: true,
        }
    }

    #[inline]
    pub fn cursor(&self) -> usize {
        self.cursor
    }

    #[inline]
    pub fn get_flag(&self) -> bool {
        self.flag
    }

    #[inline]
    fn write_u8(&mut self, v: u8) {
        self.data[self.cursor] = v;
        self.cursor = self.cursor + 1;
    }

    #[inline]
    fn write_i32(&mut self, v: i32) {
        LittleEndian::write_i32(self.data.index_mut(self.cursor..self.cursor + 4), v);
        self.cursor += 4;
    }

    #[inline]
    fn write_i64(&mut self, v: i64) {
        LittleEndian::write_i64(self.data.index_mut(self.cursor..self.cursor + 8), v);
        self.cursor += 8;
    }

    #[inline]
    fn write_u64(&mut self, v: u64) {
        LittleEndian::write_u64(self.data.index_mut(self.cursor..self.cursor + 8), v);
        self.cursor += 8;
    }

    #[inline]
    fn write_u32(&mut self, v: u32) {
        LittleEndian::write_u32(self.data.index_mut(self.cursor..self.cursor + 4), v);
        self.cursor += 4;
    }

    #[inline]
    pub fn set_u32(&mut self, start: usize, v: u32) {
        if !self.flag {
            return;
        }
        LittleEndian::write_u32(self.data.index_mut(start..self.cursor + 4), v);
    }

    #[inline]
    fn write_f64(&mut self, v: f64) {
        LittleEndian::write_f64(&mut self.data.index_mut(self.cursor..self.cursor + 8), v);
        self.cursor = self.cursor + 8;
    }

    #[inline]
    fn write(&mut self, v: &[u8]) {
        self.data.index_mut(self.cursor..).write(v).unwrap();
        self.cursor = self.cursor + v.len();
    }

    #[inline]
    pub fn set_flag(&mut self, flag: bool) {
        self.flag = flag;
    }

    #[inline]
    pub fn disable(&mut self) {
        self.flag = false;
    }

    #[inline]
    pub fn push_i32(&mut self, v: i32) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Int as u8);
        self.write_i32(v);
    }
    #[inline]
    pub fn push_i64(&mut self, v: i64) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Long as u8);
        self.write_i64(v);
    }
    #[inline]
    pub fn push_ref(&mut self, v: u32) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Ref as u8);
        self.write_u32(v);
    }
    #[inline]
    pub fn push_date(&mut self, v: u64) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Date as u8);
        self.write_u64(v);
    }
    #[inline]
    pub fn push_f64(&mut self, v: f64) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Double as u8);
        self.write_f64(v);
    }
    #[inline]
    pub fn push_null(&mut self) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Null as u8);
    }
    #[inline]
    pub fn push_string(&mut self, mode: u8, start: u32, end: u32) {
        if !self.flag {
            return;
        }
        self.write_u8(mode);
        self.write_u64(conjunct_u32_to_u64!(start, end));
    }
    #[inline]
    pub fn push_bool(&mut self, v: u8) {
        if !self.flag {
            return;
        }
        self.write(&[MagicCode::Bool as u8, v]);
    }
    #[inline]
    pub fn push_map_head(&mut self, fileds_offset: u32) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Map as u8);
        self.write_u32(fileds_offset);
    }
    #[inline]
    pub fn push_object_head(&mut self, cache_idx: u32) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Object as u8);
        self.write_u32(cache_idx);
    }
    #[inline]
    pub fn push_bytes(&mut self, start: u32, len: u32) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Bytes as u8);
        self.write_u32(start);
        self.write_u32(len);
    }
    #[inline]
    pub fn push_chunk(&mut self, chunk_type: u8, len: u32) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Chunk as u8);
        self.write_u8(chunk_type);
        self.write_u32(len);
    }
    #[inline]
    pub fn push_array_head(&mut self, len: u32) {
        if !self.flag {
            return;
        }
        self.write_u8(MagicCode::Array as u8);
        self.write_u32(len);
    }

    #[inline]
    pub fn push_map_type(
        &mut self,
        field_string: &str, // key的组合，用 , 分隔
        field_len: u32,        // key的数量，用来校验 field_string 分隔后的产物
        cache: &mut State,
        set_cache: &dyn Fn(String, u32, bool) -> u32,
    ) {
        if !self.flag {
            return;
        }
        if let Some(idx) = cache.map_shape_cache.get(field_string) {
            self.write_u8(MagicCode::TypingIdx as u8);
            self.write_u32(*idx);
        } else {
            let cache_len = cache.map_shape_cache.len() as u32;
            if cache_len >= cache.max_map_shape_cache_len as u32 {
                // 缓存满了
                self.write_u8(MagicCode::Typing as u8);
                self.write_u32(field_len as u32);
                let bytes = field_string.as_bytes();
                self.write_u32(bytes.len() as u32);
                self.write(bytes);
            } else {
                let idx = set_cache(field_string.to_owned(), field_len, true);
                cache
                    .map_shape_cache
                    .insert(field_string.to_owned(), idx as u32);
                self.write_u8(MagicCode::TypingIdx as u8);
                self.write_u32(idx);
            }
        }
    }
}


// 用来回写u16到buffer
impl<'a> OutPut<'a, u16> {
    pub fn new(v: &'a mut [u16]) -> Self {
        OutPut {
            data: v,
            cursor: 0,
            flag: true,
        }
    }

    #[inline]
    pub fn cursor(&self) -> usize {
        self.cursor
    }

    #[inline]
    fn write_u16(&mut self, v: u16) {
        self.data[self.cursor] = v;
        self.cursor += 1;
    }
}

pub struct Input<'a> {
    pub data: &'a [u8],
    pub cursor: usize,
}

// 用来读取hessian的buffer
impl<'a> Input<'a> {
    pub fn from_bytes(bytes: &[u8]) -> Input {
        Input {
            data: bytes,
            cursor: 0,
        }
    }

    /// 确定单字节字符串的宽度，读取多字节然后和 0x80 比较。
    /// 确定字符串中单字节的宽度，start表示buffer的起始位置，len表示字符的个数，返回值是确定了的个数。
    /// 如果发现了多字节的utf8就直接返回，如果剩下的个数不足8位也返回。
    /// 从 512 位的simd到64位的simd
    fn lation1_bytelen_simd(&self, start: usize, len: usize) -> usize {
        let mut used = 0;
        macro_rules! process {
            ($bit:literal) => {{
                type SimdType = Simd<u8, $bit>;
                let base = SimdType::splat(0x80);
                while (len - used) >= $bit {
                    let start = start + used;
                    let sc = self.data.index(start..start + $bit);
                    let next = SimdType::from_slice(sc);
                    if SimdType::simd_lt(next, base).all() {
                        used += $bit;
                        continue;
                    }
                    return used;
                }
            }};
        }
        process!(64); // 512 bit simd
        process!(32);
        process!(16);
        process!(8);
        used
    }

    // 将utf8转换为ucs2，当read_utf8预测Latin失败的时候会调用这个方法
    // 将结果输出到js端的ucs2_string_ret
    pub fn read_ucs2(
        &mut self,
        size: usize,
        output: &mut OutPut<u8>,
        ucs2_string_ret: &mut OutPut<u16>,
    ) {
        let start = ucs2_string_ret.cursor() as u32;
        {
            let bytes = self.data;
            let mut cursor = self.get_rpos();
            let mut i = 0;
            while i < size {
                let ch;

                if bytes[cursor] & 0b1000_0000 == 0b0000_0000 {
                    ch = u16::from(bytes[cursor]);
                    cursor += 1;
                } else if bytes[cursor] & 0b1110_0000 == 0b1100_0000 {
                    let a = u16::from(bytes[cursor] & 0b0001_1111);
                    let b = u16::from(bytes[cursor + 1] & 0b0011_1111);
                    ch = a << 6 | b;
                    cursor += 2;
                } else if bytes[cursor] & 0b1111_0000 == 0b1110_0000 {
                    let a = u16::from(bytes[cursor] & 0b0000_1111);
                    let b = u16::from(bytes[cursor + 1] & 0b0011_1111);
                    let c = u16::from(bytes[cursor + 2] & 0b0011_1111);
                    ch = a << 12 | b << 6 | c;
                    cursor += 3;
                } else {
                    unreachable!("unknown utf8 code");
                }
                i += 1;
                ucs2_string_ret.write_u16(ch);
            }
            self.set_rpos(cursor)
        }
        output.push_string(
            MagicCode::Ucs2String as u8,
            start,
            (start + size as u32) as u32,
        );
    }

    // 读取utf8 字符串
    pub fn read_utf8(
        &mut self,
        size: usize,
        output: &mut OutPut<u8>,
        latin1_string_ret: &mut OutPut<u8>,
        ucs2_string_ret: &mut OutPut<u16>,
    ) {
        // 首先用simd假设它是单字节的，因为单字节最常见
        let start = self.get_rpos();
        let mut has_surrogate = false;
        // 单字节长度 simd
        let mut used = self.lation1_bytelen_simd(start, size);
        // 剩下的字符数小于8，simd不能处理
        let mut remain = size - used;
        while remain > 0 {
            let cursor = start + used;
            let ch = unsafe { *self.data.get_unchecked(cursor) };
            used += if ch < 0x80 {
                1
            } else if (ch & 0xe0) == 0xc0 {
                2
            } else if (ch & 0xf0) == 0xe0 {
                // 代理码点，hessian独有的，utf8不存在这个。3个字节的要先看看有没有代理码点。
                if !has_surrogate {
                    let ch1 = unsafe { *self.data.get_unchecked(cursor + 1) } as u16;
                    let ch2 = unsafe { *self.data.get_unchecked(cursor + 2) } as u16;
                    let maybe_surrogate =
                        (((ch as u16) & 0x0f) << 12) + ((ch1 & 0x3f) << 6) + (ch2 & 0x3f);
                    if maybe_surrogate >= 0xd800 && maybe_surrogate <= 0xdfff {
                        has_surrogate = true;
                    }
                }
                3
            } else {
                panic!("string is not valid UTF-8 encode");
            };
            remain -= 1;
        }
        // 是单字节
        if size == used {
            self.set_rpos(start + used);
            let latin1_start = latin1_string_ret.cursor();
            latin1_string_ret.write(self.data.index(start..start + used));
            output.push_string(
                MagicCode::Latin1String as u8,
                latin1_start as u32,
                latin1_string_ret.cursor() as u32,
            );
        } else if has_surrogate {
            // 有代理码点的utf8
            self.set_rpos(start + used);
            output.push_string(
                MagicCode::Utf8SurrogateString as u8,
                start as u32,
                self.get_rpos() as u32,
            );
        } else {
            // ucs2
            self.read_ucs2(size, output, ucs2_string_ret);
        };
    }

    #[inline]
    pub fn skip(&mut self, len: i32) {
        self.set_rpos(self.get_rpos() + len as usize);
    }

    #[inline]
    pub fn read_u8(&mut self) -> u8 {
        let pos = self.cursor;
        self.cursor += 1;
        unsafe { *self.data.get_unchecked(pos) }
    }

    #[inline]
    pub fn read_i8(&mut self) -> i8 {
        self.read_u8() as i8
    }

    #[inline]
    pub fn read_u16(&mut self) -> u16 {
        let r = BigEndian::read_u16(self.data.index(self.cursor..self.cursor + 2));
        self.cursor += 2;
        r
    }

    #[inline]
    pub fn read_i16(&mut self) -> i16 {
        self.read_u16() as i16
    }

    #[inline]
    pub fn read_u32(&mut self) -> u32 {
        let r = BigEndian::read_u32(self.data.index(self.cursor..self.cursor + 4));
        self.cursor += 4;
        r
    }

    #[inline]
    pub fn read_i32(&mut self) -> i32 {
        self.read_u32() as i32
    }

    #[inline]
    pub fn read_u64(&mut self) -> u64 {
        let r = BigEndian::read_u64(self.data.index(self.cursor..self.cursor + 8));
        self.cursor += 8;
        r
    }

    #[inline]
    pub fn read_i64(&mut self) -> i64 {
        self.read_u64() as i64
    }

    #[inline]
    pub fn read_f32(&mut self) -> f32 {
        let r = BigEndian::read_f32(self.data.index(self.cursor..self.cursor + 4));
        self.cursor += 4;
        r
    }

    #[inline]
    pub fn read_f64(&mut self) -> f64 {
        let r = BigEndian::read_f64(self.data.index(self.cursor..self.cursor + 8));
        self.cursor += 8;
        r
    }

    #[inline]
    pub fn get_rpos(&self) -> usize {
        self.cursor
    }

    #[inline]
    pub fn set_rpos(&mut self, rpos: usize) {
        self.cursor = std::cmp::min(rpos, self.data.len());
    }
}
