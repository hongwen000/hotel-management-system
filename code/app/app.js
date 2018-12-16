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
            res.json({
                "users": [
                    {
                        "id": "XXXX",
                        "credential": "XXXXX",
                        "name": "XXXX",
                        "gender": -1,
                        "birthday": "2018-01-01",
                        "phone": "13534343434",
                        "balance": 45,
                        "bonus": 100
                    },
                    {
                        "id": "XXXX",
                        "credential": "XXXXX",
                        "name": "XXXX",
                        "gender": -1,
                        "birthday": "2018-01-01",
                        "phone": "13534343434",
                        "balance": 45,
                        "bonus": 100
                    },
                    {
                        "id": "XXXX",
                        "credential": "XXXXX",
                        "name": "XXXX",
                        "gender": -1,
                        "birthday": "2018-01-01",
                        "phone": "13534343434",
                        "balance": 45,
                        "bonus": 100
                    },
                    {
                        "id": "XXXX",
                        "credential": "XXXXX",
                        "name": "XXXX",
                        "gender": -1,
                        "birthday": "2018-01-01",
                        "phone": "13534343434",
                        "balance": 45,
                        "bonus": 100
                    },
                    {
                        "id": "XXXX",
                        "credential": "XXXXX",
                        "name": "XXXX",
                        "gender": -1,
                        "birthday": "2018-01-01",
                        "phone": "13534343434",
                        "balance": 45,
                        "bonus": 100
                    }
                ]
            });
            // Not working
            for (var val in table) {
                console.log(val);
            }
            table.array.forEach(function (element) {
                console.log(element);
            });
        });
    });
});
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
exports["default"] = app;
