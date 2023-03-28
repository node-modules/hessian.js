use super::*;
use std::io::Write;
use std::ops::{Index, Range};

struct Parser<'a> {
    input: &'a mut Input<'a>,
    output: OutPut<'a, u8>,
    state: &'a mut State,
    set_cache: &'a dyn Fn(String, u32, bool) -> u32,
    latin1_string_ret: OutPut<'a, u8>,
    ucs2_string_ret: OutPut<'a, u16>,
}

enum MapKey {
    True,
    False,
    Null,
    String,
    Int(String),
    Long(String),
    Spec,
}

const FALSE: &str = "false";
const TRUE: &str = "true";
const NULL: &str = "null";
const SPEC: &str = "^||^";
const SEPARATOR: &str = ",";

// thread_local 的临时缓冲区，之所以要这个缓存区是因为每次反序列化基本都会使用，为了减少alloc，所以做成thread_local
// definition用来存放类的定义, 其中指针指向 State 的 class_shape_cache 的值中的某一项。
// buffer用来存放临时的字节
pub struct Temp {
    definition: Vec<*const ClassInfo>,
    buffer: Vec<u8>,
}
unsafe impl Sync for Temp {}
unsafe impl Send for Temp {}

static mut TEMP: Temp = Temp {
    definition: Vec::new(),
    buffer: Vec::new(),
};

impl Temp {
    pub fn get_mut_buffer() -> &'static mut Vec<u8> {
        unsafe { &mut TEMP.buffer }
    }

    pub fn get_mut_definition() -> &'static mut Vec<*const ClassInfo> {
        unsafe { &mut TEMP.definition }
    }
}

// 从一个slice中leak一个string. 生命周期和 input 一样。
#[inline]
fn leak_string_by_input_range(input: &[u8], range: Range<usize>) -> &str {
    unsafe { std::str::from_utf8_unchecked(input.index(range)) }
}

impl<'a> Parser<'a> {
    #[inline]
    fn push_kv(self: &mut Self, key: &[u8], object_key: bool) {
        let names = Temp::get_mut_buffer();
        names.write(key).unwrap(); // 写入key
        names.write(SEPARATOR.as_bytes()).unwrap(); // 写入分隔符
        if object_key {
            self.read(); // 写入key对象
        }
        self.read(); // 写入value
    }
    #[inline]
    fn assert(
        &mut self,
        method: &str,
        flag1: char,
        flag2: Option<char>,
        flag3: Option<char>,
    ) -> char {
        let flag = self.input.read_u8() as char;
        if flag == flag1 {
            return flag;
        }
        if let Some(x) = flag2 {
            if flag == x {
                return flag;
            }
        }
        if let Some(x) = flag3 {
            if flag == x {
                return flag;
            }
        }
        panic!("invalid flag: {}!", method);
    }

    #[inline]
    fn read_bool_value(&mut self) -> bool {
        let label = self.assert("readBool", 'T', Some('F'), None);
        label == 'T'
    }

    #[inline]
    fn read_bool(&mut self) {
        let is_true = self.read_bool_value();
        if is_true {
            self.output.push_bool(1);
        } else {
            self.output.push_bool(0);
        };
    }
    #[inline]
    fn read_null_value(&mut self) {
        self.assert("readNull", 'N', None, None);
    }
    #[inline]
    fn read_null(&mut self) {
        self.read_null_value();
        self.output.push_null();
    }
    #[inline]
    fn read_int_value(&mut self) -> i32 {
        let code = self.input.read_u8() as i32;
        if code >= 0x80 && code <= 0xbf {
            code - 0x90
        } else if code >= 0xc0 && code <= 0xcf {
            ((code - 0xc8) << 8) + (self.input.read_u8() as i32)
        } else if code >= 0xd0 && code <= 0xd7 {
            let b1 = self.input.read_u8() as i32;
            let b0 = self.input.read_u8() as i32;
            ((code - 0xd4) << 16) + (b1 << 8) + b0
        } else {
            self.input.read_i32() as i32
        }
    }
    #[inline]
    fn read_int(&mut self) -> i32 {
        let i = self.read_int_value();
        self.output.push_i32(i);
        i
    }
    #[inline]
    fn read_long_value(&mut self) -> i64 {
        let code = self.input.read_u8() as i64;
        if code >= 0xd8 && code <= 0xef {
            (code - 0xe0) as i64
        } else if code >= 0xf0 && code <= 0xff {
            (((code - 0xf8) << 8) + self.input.read_u8() as i64) as i64
        } else if code >= 0x38 && code <= 0x3f {
            let b1 = self.input.read_u8() as i64;
            let b0 = self.input.read_u8() as i64;
            (((code - 0x3c) << 16) + (b1 << 8) + b0) as i64
        } else if code == 0x77 {
            self.input.read_i32() as i64
        } else if code == 0x4c {
            self.input.read_i64()
        } else {
            panic!("read long error")
        }
    }
    #[inline]
    fn read_long(&mut self) {
        let v = self.read_long_value();
        self.output.push_i64(v);
    }
    #[inline]
    fn read_double(&mut self) {
        let code = self.input.read_u8();
        let i = if code == 0x44 {
            self.input.read_f64() as f64
        } else if code == 0x67 {
            0.0 as f64
        } else if code == 0x68 {
            1.0 as f64
        } else if code == 0x69 {
            self.input.read_i8() as f64
        } else if code == 0x6a {
            self.input.read_i16() as f64
        } else if code == 0x6b {
            self.input.read_f32() as f64
        } else {
            panic!("unkonw readDouble")
        };
        self.output.push_f64(i as f64);
    }
    #[inline]
    fn read_date(&mut self) {
        self.assert("readDate", 'd', None, None);
        let i = self.input.read_u64();
        self.output.push_date(i);
    }
    #[inline]
    fn read_utf8_str(&mut self, len: Option<u16>) -> Range<usize> {
        let real_len = match len {
            Some(x) => x,
            _ => self.input.read_u16(),
        };
        let start = self.input.cursor;
        self.input.read_utf8(real_len as usize, &mut self.output, &mut self.latin1_string_ret, &mut self.ucs2_string_ret);
        start..self.input.cursor
    }
    #[inline]
    fn read_map_key(&mut self) -> MapKey {
        let code = self.get_u8();
        match code {
            0x4e => {
                self.read_null_value();
                MapKey::Null
            }
            0x54 | 0x46 => {
                if self.read_bool_value() {
                    MapKey::True
                } else {
                    MapKey::False
                }
            }
            0x49 | 0xc0..=0xcf | 0xd0..=0xd7 | 0x80..=0xbf => {
                MapKey::Int(self.read_int_value().to_string())
            }
            0x4c | 0x77 | 0xd8..=0xef | 0xf0..=0xff | 0x38..=0x3f => {
                MapKey::Long(self.read_long_value().to_string())
            }
            0x73 | 0x53 | 0x00..=0x1f => {
                // string
                MapKey::String
            }
            0x4f | 0x6f => {
                // object
                MapKey::Spec
            }
            0x52 | 0x4a | 0x4b => {
                // ref
                MapKey::Spec
            }
            0x56 | 0x76 => panic!("array is not hashable"),
            0x48 => panic!("hashmap is not hashable"),
            0x4d => panic!("map is not hashable"),
            _ => {
                panic!("invalid map key code")
            }
        }
    }
    #[inline]
    fn read_string_key(&mut self) -> Range<usize> {
        let start = self.input.read_u8();
        if start == 0x73 {
            panic!("object key cant be string chunk")
        }
        if start <= 0x1f {
            self.read_utf8_str(Some(start as u16))
        } else if start == 0x53 {
            self.read_utf8_str(None)
        } else {
            panic!("read string key error, string muse be end")
        }
    }
    #[inline]
    fn read_string(&mut self) {
        let mut start = self.input.read_u8();
        let mut chunk_len = 0;
        let has_chunk = start == 0x73;
        let mut chunk_offset = 0;
        if has_chunk {
            self.output.push_chunk(2, 0);
            chunk_offset = self.output.cursor() - 4;
        }
        loop {
            if start == 0x73 {
                self.read_utf8_str(None);
                start = self.input.read_u8();
                chunk_len += 1;
            } else {
                break;
            }
        }
        if start <= 0x1f {
            chunk_len += 1;
            self.read_utf8_str(Some(start as u16));
        } else if start == 0x53 {
            chunk_len += 1;
            self.read_utf8_str(None);
        } else {
            panic!("string muse be end")
        }
        if has_chunk {
            self.output.set_u32(chunk_offset, chunk_len);
        }
    }
    #[inline]
    fn read_type(&mut self) -> bool {
        let pos = self.input.get_rpos();
        let code = self.input.read_u8();
        match code {
            0x74 => {
                let len = self.input.read_u16();
                self.input.skip(len as i32);
                true
            }
            0x54 | 0x75 => {
                self.read_int();
                true
            }
            _ => {
                self.input.set_rpos(pos);
                false
            }
        }
    }

    #[inline]
    fn gen_cls_info(&mut self, len: u32) -> Box<ClassInfo>{
        let start = self.input.get_rpos();
        let mut fields = Vec::<u8>::new();
        let mut skip_idx = Vec::<u32>::new();
        let mut field_count = 0;
        for i in 0..len {
            let range = self.with_stop_push(|this: &mut Self| this.read_string_key());
            let field_str = leak_string_by_input_range(self.input.data, range);
            if field_str.starts_with("this$") {
                skip_idx.push(i);
            } else {
                fields.write(field_str.as_bytes()).unwrap();
                fields.write(SEPARATOR.as_bytes()).unwrap();
                field_count += 1;
            }
        }
        let end = self.input.get_rpos();
        let idx = (self.set_cache)(
            String::from_utf8(fields).unwrap(),
            field_count,
            false,
        );
        // classInfo会被转化成指针放到 definition里面，因此要放到box，直接放到vec有可能导致野指针，因为vec没有pin
        Box::new(ClassInfo {
            len,
            skip_idx,
            bytelen: (end - start) as u32,
            cache_idx: idx,
        })
    }


    /// 读取object的类定义
    #[inline]
    fn read_object_def(&mut self) {
        let size = self.read_int();
        let range = self.read_utf8_str(Some(size as u16));
        let cls_name = leak_string_by_input_range(self.input.data, range);
        let len = self.read_int() as u32;
        enum CacheStatus {
            Miss,
            Hit(*const ClassInfo)
        }
        // 先从缓存里面通过cls_name读取
        let cache_status = match self.state.class_shape_cache.get(cls_name) {
            Some(lst) => {
                // 命中缓存后开始读取缓存值
                // 在缓存值中查找字段个数等于当前字段个数的缓存
                let target = lst.iter().find(|x| {
                    x.len == len
                });
                // 如果找到缓存就返回缓存的指针, 否则就通过gen_cls_info 插入缓存，然后返回指针
                if let Some(target) = target {
                    self.input.skip(target.bytelen as i32);
                    CacheStatus::Hit(&**target as *const ClassInfo)
                } else {
                    CacheStatus::Miss
                }
            }
            None => {
                CacheStatus::Miss
            }
        };
        // 将换成指针push到definition缓冲区，hessian用这个办法来共享类型定义
        let info_ptr = match cache_status {
            CacheStatus::Hit(info_ptr) => {
                info_ptr
            },
            CacheStatus::Miss => {
                let info = self.gen_cls_info(len);
                let info_ptr = &*info as *const ClassInfo;
                if !self.state.class_shape_cache.contains_key(cls_name) {
                    self.state
                        .class_shape_cache
                        .insert(cls_name.to_owned(), vec![info]);
                } else {
                    let lst = self.state.class_shape_cache.get_mut(cls_name).expect("should contains");
                    lst.push(info);
                }
                info_ptr
            },
        };
        Temp::get_mut_definition().push(info_ptr);

    }

    // 用于禁止push的情况，比如对象的key
    #[inline]
    fn with_stop_push<T>(&mut self, fun: impl FnOnce(&mut Self) -> T) -> T {
        let origin_flag = self.output.get_flag();
        self.output.disable();
        let r = fun(self);
        self.output.set_flag(origin_flag);
        r
    }

    fn read_object(&mut self) {
        let code = self.input.read_u8();
        if code == 0x4f {
            self.with_stop_push(|this: &mut Self| this.read_object_def());
            self.read_object();
        } else if code == 0x6f {
            let class_ref = self.with_stop_push(|this: &mut Self| this.read_int() as usize);
            let definition = unsafe { &*Temp::get_mut_definition()[class_ref] };
            self.output.push_object_head(definition.cache_idx);
            for i in 0..definition.len {
                if definition.skip_idx.contains(&i) {
                    self.with_stop_push(|this: &mut Self| this.read());
                } else {
                    self.read();
                }
            }
        } else {
            panic!("read object error");
        }
    }

    #[inline]
    fn get_u8(&mut self) -> u8 {
        let ret = self.input.read_u8();
        self.input.cursor -= 1;
        ret
    }
    #[inline]
    fn read_array(&mut self) {
        let code = self.input.read_u8();
        let mut end = true;
        let len = self.with_stop_push(|this: &mut Self| {
            if code == 0x56 {
                this.read_type();
                let code = this.input.read_u8();
                if code == 0x6e {
                    this.input.read_u8() as u32
                } else if code == 0x6c {
                    this.input.read_i32() as u32
                } else {
                    0 as u32
                }
            } else {
                end = false;
                this.read_int();
                this.read_int() as u32
            }
        });
        self.output.push_array_head(len as u32);
        for _i in 0..len {
            self.read();
        }
        if end {
            self.input.set_rpos(self.input.get_rpos() + 1);
        }
    }
    #[inline]
    fn read_ref_id(&mut self) -> u32 {
        let code = self.input.read_u8();

        if code == 0x4a {
            self.input.read_u8() as u32
        } else if code == 0x4b {
            self.input.read_u16() as u32
        } else if code == 0x52 {
            self.input.read_i32() as u32
        } else {
            panic!("read_ref_id error")
        }
    }
    
    #[inline]
    fn read_ref(&mut self) {
        let v = self.read_ref_id();
        self.output.push_ref(v);
    }

    #[inline]
    fn read_map(&mut self) {
        let output_start = self.output.cursor();
        self.output.push_map_head(0);
        let names_start = Temp::get_mut_buffer().len();
        let field_len = {
            let mut code = self.get_u8();
            let mut field_len = 0;
            while code != 0x7a {
                match self.read_map_key() {
                    MapKey::True => self.push_kv(TRUE.as_bytes(), false),
                    MapKey::False => self.push_kv(FALSE.as_bytes(), false),
                    MapKey::Null => self.push_kv(NULL.as_bytes(), false),
                    MapKey::String => {
                        let range = self.with_stop_push(|this: &mut Self| this.read_string_key());
                        self.push_kv(self.input.data.index(range), false)
                    }
                    MapKey::Int(s) => self.push_kv(s.as_bytes(), false),
                    MapKey::Long(s) => self.push_kv(s.as_bytes(), false),
                    MapKey::Spec => self.push_kv(SPEC.as_bytes(), true),
                };
                code = self.get_u8();
                field_len += 1;
            }
            field_len
        };
        let names = Temp::get_mut_buffer();
        self.output
            .set_u32(output_start + 1, (self.output.cursor() - output_start) as u32);
        let field_string = leak_string_by_input_range(names.as_slice(), names_start..names.len());
        self.output
            .push_map_type(field_string, field_len, &mut self.state, self.set_cache);
        names.drain(names_start..);
        self.input.read_u8();
    }

    fn read_hashmap(&mut self) {
        let code = self.input.read_u8();
        if code != 0x48 {
            panic!("read hashmap error");
        }
        self.read_map();
    }

    fn read_real_map(&mut self) {
        let code = self.input.read_u8();
        if code != 0x4d {
            panic!("read real map error");
        }
        self.with_stop_push(|this: &mut Self| this.read_type());
        self.read_map();
    }

    fn read_bytes(&mut self) {
        let mut code = self.input.read_u8();
        let start = self.input.cursor as u32;
        if code >= 0x20 && code <= 0x2f {
            let len = code - 0x20;
            self.output.push_bytes(start, len as u32);
            self.input.cursor += len as usize;
            return;
        }
        self.output.push_chunk(1, 1);
        let chunk_len_offset = self.output.cursor() - 4;

        let mut chunk_len = 0;
        // push chunk
        while code == 0x62 {
            let len = self.input.read_u16();
            let start = self.input.cursor as u32;
            self.output.push_bytes(start, len as u32);
            self.input.cursor += len as usize;
            code = self.input.read_u8();
            chunk_len += 1;
        }

        // last chunk
        if code == 0x42 {
            let len = self.input.read_u16();
            let start = self.input.cursor as u32;
            self.output.push_bytes(start, len as u32);
            self.input.cursor += len as usize;
            chunk_len += 1;
        } else if code >= 0x20 && code <= 0x2f {
            let len = code - 0x20;
            let start = self.input.cursor as u32;
            self.output.push_bytes(start, len as u32);
            chunk_len += 1;
            self.input.cursor += len as usize;
        } else {
            panic!("read bytes error")
        }
        self.output.set_u32(chunk_len_offset, chunk_len as u32);
    }

    fn read(&mut self) {
        let code = self.get_u8();
        match code {
            0x4e => {
                self.read_null();
            }
            0x54 | 0x46 => {
                self.read_bool();
            }
            0x49 | 0xc0..=0xcf | 0xd0..=0xd7 | 0x80..=0xbf => {
                self.read_int();
            }
            0x4c | 0x77 | 0xd8..=0xef | 0xf0..=0xff | 0x38..=0x3f => {
                self.read_long();
            }
            0x44 | 0x67 | 0x68 | 0x69 | 0x6a | 0x6b => {
                self.read_double();
            }
            0x64 => {
                self.read_date();
            }
            0x62 | 0x42 | 0x20..=0x2f => {
                self.read_bytes();
            }
            0x73 | 0x53 | 0x00..=0x1f => {
                self.read_string();
            } // string
            0x4f | 0x6f => self.read_object(),
            0x52 | 0x4a | 0x4b => {
                self.read_ref();
            }
            0x56 | 0x76 => {
                self.read_array();
            }

            0x48 => self.read_hashmap(),
            0x4d => self.read_real_map(),
            //0x74 => Arc::new(HessianObject::String(self.read_type())),
            _ => {
                panic!("invalid code")
            }
        }
    }
}

pub fn from_byte_buffer(
    bytes: &[u8],
    output: OutPut<u8>,
    state: &mut State,
    offset: u32,
    set_cache: &dyn Fn(String, u32, bool) -> u32,
    latin1_string_ret: OutPut<u8>,
    ucs2_string_ret: OutPut<u16>,
) -> (usize, usize) {
    let mut input = Input::from_bytes(bytes);
    input.cursor = offset as usize;
    // 清空缓存
    Temp::get_mut_buffer().drain(0..);
    Temp::get_mut_definition().drain(0..);
    let mut parser = Parser {
        input: &mut input,
        output,
        state,
        set_cache,
        latin1_string_ret,
        ucs2_string_ret,
    };
    parser.read();
    // buffer是一个stack结构，parse完成后应该都弹栈了，否则可能有问题
    assert!(Temp::get_mut_buffer().len() == 0);

    // 返回2个字符串的长度，因为这2个buffer是一个很大的缓冲区，所以需要知道缓冲区里面字符串的真实长度
    (
        parser.latin1_string_ret.cursor(),
        parser.ucs2_string_ret.cursor(),
    )
}
