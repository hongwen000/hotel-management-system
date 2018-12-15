# 后端接口说明

## 房间预订子系统

###  API：查询可用房间

#### 发送请求字段说明

```json
{
    "check_in":"2018-02-12",
    //...以及其他属性
}
```



发送的json请求需要含有以下属性：

| 属性名    | 类型   | 值                                         |
| --------- | ------ | ------------------------------------------ |
| check_in  | string | 入住时间（%Y-%M-%D 如 2018-02-12)          |
| check_out | string | 退房时间（%Y-%M-%D 如 2018-02-15)          |
| capacity  | int    | 最小容纳人数                               |
| wifi      | bool   | 是否要求wifi，0表示不限定，1表示必须有wifi |
| breakfast | bool   | 是否要求早餐，0表示不限定，1表示必须有早餐 |

#### 接受字段说明

```json
{
    "rooms":[
        {
            "room_id" : "XXXXXX",
            "floor" : 4,
            "room_num" : 1103,
            "price" : 100,
            "breakfast" : 1,
            "wifi" : 0,
            "name" : "豪华双人房",
            "capacity" : 2
        },
        {
            //...（同上）
        }
    ]
}
```



| 属性名    | 类型   | 值                             |
| --------- | ------ | ------------------------------ |
| room_id   | string | 房间的唯一id                   |
| floor     | int    | 房间所在层数（1,2,3,4....)     |
| room_num  | int    | 房间的房号(如 101,503,1103等 ) |
| price     | int    | 房价(单位为元)                 |
| breakfast | bool   | 0 表示没有早餐，1表示有早餐    |
| wifi      | bool   | 0表示没有wifi，1表示有wifi     |
| name      | string | 房型的名称（豪华双人房）       |
| capacity  | int    | 房间所能容纳的最大人数         |

### API：预订房间



## 用户档案子系统

### API ：查询指定用户信息



### API ：查询满足条件的用户

#### 接口说明

输入一些条件，返回满足这些条件的用户列表

1. string类型的参数，空串表示不指定
2. int类型的参数，-1表示不指定

#### URL

`/api/query_user`

#### 请求示例及参数

```json
{
    "credential" : "XXXXXXXXXXXXXXXXXX",
    // .... 其他参数
}
```



| 属性        | 类型   | 值                         |
| ----------- | ------ | -------------------------- |
| credential  | string | 身份证号                   |
| name        | string | 用户名称                   |
| gender      | int    | -1不指定，0是雄性，1是雌性 |
| phone       | string | 手机号码                   |
| balance_min | int    | 余额下限（单位为元）       |
| balance_max | int    | 余额上限（单位为元）       |
| bonus_min   | int    | 积分下限                   |
| bonus_max   | int    | 积分上限                   |

#### 响应示例与参数

```json
{
    "users":[
    	{
            "id":"XXXX",
            "credential":"XXXXX",
            "name":"XXXX",
            "gender":-1,
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
| gender      | int    | -1不指定，0是雄性，1是雌性 |
|birthday | string | 生日“2018-01-01” |
| phone       | string | 手机号码                   |
| balance     | int    | 余额（单位为元）       |
| bonus   | int    | 积分                   |
