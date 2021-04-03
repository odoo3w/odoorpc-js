#### 设计说明

#### env

1. env.model 函数 , 获取的 是 某个 view 信息, 一定有 view info

#### browse

1. browse 函数 call 的是 read
2. 普通字段 直接有值里
3. m2o 字段, 有 display_name 了
4. m2m 字段, 待定, 一个例子.
5. res.partner 的 category_id, call read( fields=[color, display_name])
6. o2m 字段: view info 已经有信息了, env.model( o2m ) 时 应该 提供 parent 的 view info
7. 做一个 Model.env_o2m(o2m_field_name) 类似这样的函数 获取 model
8. $$o2m, 双 $$ 做 异步调用
