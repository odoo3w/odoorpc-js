#### 设计说明

2 create users
1 m2m 要处理

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

#### web html

1. note book , 2, TAG P class = "" 没有 undefined
2. char = false, value = "" ref
3. company_id, m2o

4. label, readonly ?
5. partner, type, radio
6. address_name label 没有 class
7. phone, mobile, widget: "phone"
8. is_blacklisted ?
9. widget: "email"
10. website widget: "url"
11. m2o 特殊处理
12. widget: "many2many_tags"
13. child_ids, mode = kanban
14. name: "property_payment_term_id" widget: "selection"
