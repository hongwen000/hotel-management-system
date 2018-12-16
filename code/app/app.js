"use strict";
exports.__esModule = true;
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var pool = require("./sql");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var app = express();
var port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({ secret: "wyf and lxr NB!" }));
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'html/login.html'));
});
app.get('/api/login', function (req, res) {
    console.log(req.query.username);
    console.log(req.query.password);
    if (req.query.username === '' || req.query.password === '') {
        res.json({
            'msg': 'error, please input not empty username and password',
            'errno': -1
        });
        return;
    }
    if (req.query.username === 'root' && req.query.password === 'rootpassword') {
        req.session.user = req.query.username;
        res.json({
            'msg': 'success',
            'errno': 0
        });
        return;
    }
    else {
        res.json({
            'msg': 'error password or usernmame',
            'errno': -1
        });
        return;
    }
});
app.use('/query', function (req, res, next) {
    // if (!req.session.user) {
    //   res.redirect('/login');
    // }
    next();
});
app.get('/query', function (req, res) {
    res.sendFile(path.join(__dirname, 'html/index.html'));
});
app.all('/api/query', function (req, res) {
    pool.getConnection()
        .then(function (conn) {
        conn.query(req.body.query)
            .then(function (rows) {
            res.json({
                'data': rows
            });
        })["catch"](function (err) {
            res.json({
                'data': "err in sql: " + err
            });
        });
        conn.end();
    })["catch"](function () {
        res.json({
            'data': 'ERROR, connection failed'
        });
    });
});
app.use('/static', express.static(path.join(__dirname, 'static/')));
app.all('/api/query_user', function (req, res) {
    var credential = req.body.credential;
    var name = req.body.name;
    var gender = req.body.gender;
    var phone = req.body.phone;
    var balance_min = req.body.balance_min;
    var balance_max = req.body.balance_max;
    var bonus_min = req.body.bonus_min;
    var bonus_max = req.body.bonus_max;
    console.log(req.body);
    var query = 'select * from User as u where ? and ? and ? and ? and ? and ? and ? and ?';
    var arg = [];
    // 精确匹配证件号
    if (credential != '') {
        arg.push('u.credential = ' + credential);
    }
    else {
        arg.push('1=1');
    }
    // 模糊匹配姓名
    if (name != '') {
        arg.push("u.name LIKE'%" + name + "%'");
    }
    else {
        arg.push('1=1');
    }
    if (gender != '-1') {
        arg.push("u.gender = " + gender);
    }
    else {
        arg.push('1=1');
    }
    if (phone != '') {
        arg.push('u.phone = ' + phone);
    }
    else {
        arg.push('1=1');
    }
    if (balance_min != '') {
        arg.push("u.balance >= " + balance_min);
    }
    else {
        arg.push('1=1');
    }
    if (balance_max != '') {
        arg.push("u.balance <= " + balance_max);
    }
    else {
        arg.push('1=1');
    }
    if (bonus_min != '') {
        arg.push("u.bonus >= " + bonus_min);
    }
    else {
        arg.push('1=1');
    }
    if (bonus_max != '') {
        arg.push("u.bonus <= " + bonus_max);
    }
    else {
        arg.push('1=1');
    }
    console.debug(arg);
    pool.getConnection()
        .then(function (conn) {
        conn.query(query, arg)
            .then(function (table) {
            // console.log(table)
            for (var i = 0; i < table.length; ++i) {
                if (table[i].gender == 0) {
                    table[i].gender = 'man';
                }
                else if (table[i].gender == 0) {
                    table[i].gender = 'woman';
                }
                var birthdate = table[i].birthdate.toISOString();
                table[i].birthdate = birthdate.substr(0, 10);
            }
            res.json({
                "users": JSON.stringify(table)
            });
        });
        conn.end();
    })["catch"](function (err) {
        console.log('ERROR' + err);
    });
});
app.all('/api/insert_user', function (req, res) {
    // console.log(req)
    var credential = req.body.credential;
    var name = req.body.name;
    var gender = req.body.gender;
    var birthdate = req.body.birthdate;
    var phone = req.body.phone;
    // TODO:前端应该可以不用下面这两项？可以设置成默认值0吗
    var balance = req.body.balance;
    var bonus = req.body.bonus;
    console.log(req.body);
    var query = 'insert into User (credential, name, gender, birthdate, phone, balance, bonus) value (?, ?, ?, ?, ?, ?, ?);';
    // TODO: 没有处理输入值为空的情况
    var arg = [];
    arg.push(credential);
    arg.push(name);
    if (gender === 'man') {
        arg.push('0');
    }
    else if (gender === 'woman') {
        arg.push('1');
    }
    else {
        arg.push(undefined);
    }
    // arg.push(gender)
    arg.push(birthdate);
    arg.push(phone);
    arg.push(balance);
    arg.push(bonus);
    // match the credential
    // ...
    console.debug(arg);
    pool.getConnection()
        .then(function (conn) {
        conn.query(query, arg)
            .then(function (msg) {
            console.log(msg);
            res.json({
                'error_code': 0,
                'error_msg': undefined
            });
        })["catch"](function (error) {
            console.log(error);
            res.json({
                'error_code': 1,
                'error_msg': error
            });
        });
        conn.end();
    })["catch"](function (error) {
        console.log(error);
        res.json({
            'error_code': 1,
            'error_msg': error
        });
    });
});
app.all('/api/insert_room_type', function (req, res) {
    // console.log(req)
    var name = req.body.name;
    var capacity = req.body.capacity;
    var wifi = req.body.wifi;
    var breakfast = req.body.breakfast;
    console.log(req.body);
    var query = 'insert into RoomType (name, capacity, wifi,breakfast) value (?, ?, ?, ?);';
    // TODO: 没有处理输入值为空的情况
    var arg = [];
    try {
        if (name === undefined) {
            throw "floor is empty !!";
        }
        if (capacity === undefined) {
            throw "capacity is empty !!";
        }
        if (wifi === undefined) {
            throw "wifi is empty !!";
        }
        if (breakfast === undefined) {
            throw "breakfast is empty !!";
        }
        arg.push(name);
        arg.push(capacity);
        arg.push(wifi);
        arg.push(breakfast);
        console.debug(arg);
        pool.getConnection()
            .then(function (conn) {
            conn.query(query, arg)
                .then(function (msg) {
                console.log(msg);
                res.json({
                    'error_code': 0,
                    'error_msg': undefined
                });
            })["catch"](function (error) {
                console.log(error);
                res.json({
                    'error_code': 1,
                    // TODO: 错误信息不是字符串，可能需要改一下
                    'error_msg': error
                });
            });
            conn.end();
        })["catch"](function (error) {
            console.log(error);
            res.json({
                'error_code': 1,
                // TODO: 错误信息不是字符串，可能需要改一下
                'error_msg': error
            });
        });
    }
    catch (error) {
        res.json({
            'error_code': 1,
            'error_msg': error
        });
    }
});
app.all('/api/insert_room', function (req, res) {
    // TODO:未测试，先做房型
    // console.log(req)
    var floor = req.body.floor;
    var room_num = req.body.room_num;
    var price = req.body.price;
    console.log(req.body);
    var query = 'insert into Room (floor, room_num, price) value (?, ?, ?);';
    // TODO: 没有处理输入值为空的情况
    var arg = [];
    try {
        if (floor === undefined) {
            throw "floor is empty !!";
        }
        if (room_num === undefined) {
            throw "room_num is empty !!";
        }
        if (price === undefined) {
            throw "price is empty !!";
        }
        arg.push(floor);
        arg.push(room_num);
        arg.push(price);
        console.debug(arg);
        pool.getConnection()
            .then(function (conn) {
            conn.query(query, arg)
                .then(function (msg) {
                console.log(msg);
                res.json({
                    'error_code': 0,
                    'error_msg': undefined
                });
            })["catch"](function (error) {
                console.log(error);
                res.json({
                    'error_code': 1,
                    'error_msg': error
                });
            });
            conn.end();
        })["catch"](function (error) {
            console.log(error);
            res.json({
                'error_code': 1,
                'error_msg': error
            });
        });
    }
    catch (error) {
        res.json({
            'error_code': 1,
            'error_msg': error
        });
    }
});
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
exports["default"] = app;
