### 用户

1. model name: res.users
2. 关键字段: login, password, 用户名 和密码

### 用户背后的 自然人

1. model name: res.partner
2. 关键字段: name, mobile, 名称 电话

### 场地

1. model name: res.partner
2. 关键字段: name, ref, street, comment, category_id, 名称 英文名 楼层 说明 类别

### 场地的 某一张台子

1. model name: res.partner
2. 关键字段: name, ref, parent_id, comment, category_id, 名称 编号 对应的场地 说明 类别

### 可预约的 时段+场地+台子

1. model name: event.event
2. 关键字段: address_id, date_begin, date_end
3. address_id 对应的 场地的某张台子
4. date_begin, 开始时间 都是整点小时
5. date_end, 结束时间, 都是整点小时
6. 同一个场地的一张台。 每个小时 一条记录
7. 查询时 调个函数 test_schedule_event 里的代码, 自动创建未来 7 天的数据记录, 天数可设置
8. 天数可设置, 每天 开放的 时段 可设置

### 可预约的 时段+场地+台子

1. model name: event.event
2. 关键字段: address_id, date_begin, date_end
3. address_id 对应的 场地的某张台子
4. date_begin, 开始时间 都是整点小时
5. date_end, 结束时间, 都是整点小时
6. 同一个场地的一张台。 每个小时 一条记录
7. 查询时 调个函数 test_schedule_event 里的代码, 自动创建未来 7 天的数据记录, 天数可设置
8. 天数可设置, 每天 开放的 时段 可设置
9. 只能有一个人预约

### 预约记录

1. model name: event.registration
2. 关键字段: event_id, partner_id
3. event_id 对应的 上面的 可预约的 时段+场地+台子
4. partner_id, 预约的自然人

### 登陆后 存 session_id

1. 登陆 login 后， 取 session_id
2. 本地 localstorage 存储
3. 目前是 存 cookie

### 页面刷新

1. 页面刷新, 调 api 里的一个函数，
2. 读取 localstorage 里的 session_id
3. 发请求，验证 session_id 是否过期
4. 过期 则 返回登陆页面
5. 未过期 则 初始化 api 的基本配置
6. 目前 这个函数 是 读取的 cookie。
7. 我改下 增加 localstorage 存 session_id 的机制
