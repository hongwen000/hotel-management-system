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
    var query = 'select * from User as u where 1 = 1';
    // 精确匹配证件号
    if (credential != '') {
        query = query + (' and u.credential = ' + credential);
    }
    // 模糊匹配姓名
    if (name != '') {
        query = query + (" and u.name LIKE'%" + name + "%'");
    }
    if (gender != '-1') {
        query = query + (" and u.gender = " + gender);
    }
    if (phone != '') {
        query = query + (' and u.phone = ' + phone);
    }
    if (balance_min != '') {
        query = query + (" and u.balance >= " + balance_min);
    }
    if (balance_max != '') {
        query = query + (" and u.balance <= " + balance_max);
    }
    if (bonus_min != '') {
        query = query + (" and u.bonus >= " + bonus_min);
    }
    if (bonus_max != '') {
        console.log("here");
        query = query + (" and u.bonus <= " + bonus_max);
    }
    console.debug(query);
    pool.getConnection()
        .then(function (conn) {
        conn.query(query)
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
    })["catch"](function (err) {
        console.log('ERROR' + err);
    });
});
app.all('/api/insert_user', function (req, res) {
    var credential = req.body.credential;
    var name = req.body.name;
    var gender = req.body.gender;
    var birthdate = req.body.birthdate;
    var phone = req.body.phone;
    var balance = req.body.string;
    var bonus = req.body.string;
    console.log(req.body);
    var query = "insert into User(credential, name, gender, birthdate, phone, bonus, balance)\n    values(" + credential + ", " + name + ", " + gender + ", " + birthdate + ", " + phone + ", " + bonus + ", " + balance + ")";
    pool.getConnection()
        .then(function (conn) {
        conn.query(query)
            .then(function (ret) {
            console.log(ret);
            res.json({
                "users": JSON.stringify(ret)
            });
        });
    })["catch"](function (err) {
        console.log('ERROR' + err);
    });
});
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
exports["default"] = app;
