use std::collections::HashMap;

// Buffer里面用来标记类型的魔法数
pub enum MagicCode {
    Object = 1,
    Array = 2,
    Null = 3,
    Ucs2String = 4,
    Bool = 5,
    Int = 6,
    Typing = 7,
    TypingIdx = 8,
    Double = 9,
    Long = 10,
    Date = 11,
    Ref = 12,
    Bytes = 13,
    Chunk = 14,
    Map = 15,
    Utf8SurrogateString = 16,
    Latin1String = 17,
}

// 类型信息，用来缓存类型的信息，结合State使用
// len 表示字段的个数
// bytelen 表示类型的字节数
// skip_idx 表示需要跳过的字段, 以 this$ 开头的
// cache_idx 表示缓存在js端的索引，根据这个索引告诉js用哪一个缓存
#[derive(Debug)]
pub struct ClassInfo {
    pub len: u32,
    pub bytelen: u32,
    pub skip_idx: Vec<u32>,
    pub cache_idx: u32,
}

// 反序列化的缓存状态，一般按facade来隔离
// map_shape_cache 表示map的缓存，key是将map的key用逗号join起来的字符串，值是js端的缓存索引
// max_map_shape_cache_len 表示最大的缓存索引
// class_shape_cache 表示object的缓存， string是类名， 值是 ClassInfo 的数组，包含同名类型下不同字段个数的缓存
#[derive(Debug)]
pub struct State {
    pub map_shape_cache: HashMap<String, u32>,
    pub max_map_shape_cache_len: u32,
    pub class_shape_cache: HashMap<String, Vec<Box<ClassInfo>>>,
}

