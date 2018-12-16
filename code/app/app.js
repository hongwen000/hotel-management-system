"use strict";
exports.__esModule = true;
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var pool = require("./sql");
var app = express();
var port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/', function (req, res) {
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
            console.log(table);
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
    })["catch"](function (err) {
        console.log('ERROR' + err);
    });
});
app.all('/api/insert_user', function (req, res) {
    // console.log(req)
    var credential = req.body.credential;
    var name = req.body.name;
    var gender = req.body.gender;
    var phone = req.body.phone;
    var birthdate = req.body.birthdate;
    // TODO:前端应该可以不用下面这两项？可以设置成默认值0吗
    var balance = req.body.balance;
    var bonus = req.body.bonus;
    console.log(req.body);
    var query = 'insert into Hotel.User(credential, name, gender, birthdate, phone, balance, bonus) values (?, ?, ?, ?, ?, ?,?);';
    // TODO: 构造arg列表
    var arg = [];
    arg.push(credential);
    arg.push(name);
    arg.push(gender);
    arg.push(phone);
    arg.push(birthdate);
    arg.push(balance);
    arg.push(bonus);
    // match the credential
    // ...
    console.debug(arg);
    pool.getConnection()
        .then(function (conn) {
        conn.query(query, arg)
            .then(function (res) {
            console.log(res);
            conn.end();
        })["catch"](function (err) {
            // TODO: handle the error
            conn.end();
        });
    })["catch"](function (error) {
        // TODO: handle the error
    });
});
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
exports["default"] = app;
