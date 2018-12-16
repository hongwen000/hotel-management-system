# 后端接口说明

1. 请求参数中，若为空串均为不指定（因此大多数字段都使用了string类型）
2. 相应的参数具有明确类型（如果int类型的就返回int类型二不是string）

## 房间预订子系统

###  API：查询可用房间

### URL

`/api/query_room`

#### 请求示例及参数

```json
{
    "check_in":"2018-02-12",
    //...以及其他属性
}
```


发送的json请求需要含有以下属性：

| 属性名    | 类型   | 值                                          |
| --------- | ------ | ------------------------------------------- |
| check_in  | string | 入住时间（%Y-%M-%D 如 2018-02-12)           |
| check_out | string | 退房时间（%Y-%M-%D 如 2018-02-15)           |
| capacity  | string | 最小容纳人数                                |
| wifi      | string | 是否要求wifi，空表示不指定，1表示必须有wifi |
| breakfast | string | 是否要求早餐，空表示不限定，1表示必须有早餐 |

#### 响应示例及参数

```json
{
    "rooms":[
        {
            "room_id" : "XXXXXX",
            "floor" : 4,
            "room_num" : 1103,
            "price" : 100,
            "breakfast" : "Yes",
            "wifi" : "No",
            "name" : "豪华双人房",
            "capacity" : 2
        },
        {
            //...（同上）
        }
    ]
}
```



| 属性名    | 类型   | 值                                 |
| --------- | ------ | ---------------------------------- |
| room_id   | string | 房间的唯一id                       |
| floor     | int    | 房间所在层数（1,2,3,4....)         |
| room_num  | int    | 房间的房号(如 101,503,1103等 )     |
| price     | int    | 房价(单位为元)                     |
| breakfast | string | 'No' 表示没有早餐，'Yes'表示有早餐 |
| wifi      | string | 'No'表示没有wifi，'Yes'表示有wifi  |
| name      | string | 房型的名称（豪华双人房）           |
| capacity  | int    | 房间所能容纳的最大人数             |

### API：预订房间

TODO:

## 用户档案子系统

### API ：查询指定用户信息

TODO:



### API ：查询满足条件的用户

#### 接口说明

输入一些条件，返回满足这些条件的用户列表

1. string类型的参数，空串表示不指定

#### URL

`/api/query_user`

#### 请求示例及参数

```json
{
    "credential" : "XXXXXXXXXXXXXXXXXX",
    // .... 其他参数
}
```

| 属性        | 类型   | 值                                       |
| ----------- | ------ | ---------------------------------------- |
| credential  | string | 身份证号                                 |
| name        | string | 用户名称                                 |
| gender      | string | 空表示不指定，'man'是雄性，'woman'是雌性 |
| phone       | string | 手机号码                                 |
| balance_min | string | 余额下限（单位为元）                     |
| balance_max | string | 余额上限（单位为元）                     |
| bonus_min   | string | 积分下限                                 |
| bonus_max   | string | 积分上限                                 |

#### 响应示例与参数

```json
{
    "users":[
    	{
            "id":"XXXX",
            "credential":"XXXXX",
            "name":"XXXX",
            "gender":"man",
            "birthday":"2018-01-01",
            "phone":"13534343434",
            "balance":45,
            "bonus":100
        },
        {
            //.....
        }
    ]
}
```

参数说明：
| 属性        | 类型   | 值                         |
| ----------- | ------ | -------------------------- |
| id          | string | 用户id                     |
| credential  | string | 身份证号                   |
| name        | string | 用户名称                   |
| gender      | string | 'man'是雄性，'woman'是雌性,空表示未知 |
|birthday | string | 生日“2018-01-01” |
| phone       | string | 手机号码                   |
| balance     | int    | 余额（单位为元）       |
| bonus   | int    | 积分                   |

### API：增加、修改、删除用户

#### URL

`/api/insert_user`

#### 请求示例及参数说明

```json
{
    "credential":"XXXXXXX",
    "name":"XXX",
    // ...
}
```

| 属性       | 类型   | 值                                       |
| ---------- | ------ | ---------------------------------------- |
| credential | string | 身份证号                                 |
| name       | string | 用户名称                                 |
| gender     | string | 空表示不指定，'man'是雄性，'woman'是雌性 |
| birthdate  | string | 用户出生日期（如“2018-01-01”）           |
| phone      | string | 手机号码                                 |
| balance    | string | 余额（单位为元）                         |
| bonus | string | 积分下限                                 |

#### 响应示例及参数说明

```json
{
    "error_code":0,
    "error_msg":""
}
```

| 属性名     | 类型   | 值                                            |
| ---------- | ------ | --------------------------------------------- |
| errro_code | int    | 0 为无错误，1为有错误（按需求再细分错误类型） |
| error_msg  | string | 错误信息                                      |

## 房间信息子系统

### API：增加房间
TODO:

### API：减少房间
TODO:

### API：修改房间
TODO:

### API：增加房型
TODO:

### API：减少房型
TODO:

### API：修改房型
TODO:

### API：查询满足条件的房间
TODO:


## 订单管理子系统

### API：查询符合条件的订单的状态及信息

TODO:

### API：设置指定订单状态
TODO: