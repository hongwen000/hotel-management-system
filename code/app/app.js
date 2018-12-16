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
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
exports["default"] = app;
