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
app.get('/api/query_user', function (req, res) {
    var credential = req.body.credential;
    var name = req.body.name;
    var gender = req.body.number;
    var phone = req.body.phone;
    var balance_min = req.body.balance_min;
    var balance_max = req.body.balance_max;
    var bonus_min = req.body.bonus_min;
    var bonus_max = req.body.bonus_max;
    var query = 'select * from User as u where 1 = 1';
    // 精确匹配证件号
    if (credential != '') {
        query.concat(' and u.credential = ' + credential);
    }
    // 模糊匹配姓名
    if (name != '') {
        query.concat(" and u.name LIKE'%" + name + "%'");
    }
    if (gender != -1) {
        query.concat(" and u.gender = " + gender.toString());
    }
    if (phone != '') {
        query.concat(' and u.phone = ' + phone);
    }
    if (balance_min != -1) {
        query.concat(" and u.balance >= " + balance_min.toString());
    }
    if (balance_max != -1) {
        query.concat(" and u.balance <= " + balance_max.toString());
    }
    if (bonus_min != -1) {
        query.concat(" and u.bonus >= " + bonus_min.toString());
    }
    if (bonus_max != -1) {
        query.concat(" and u.bonus <= " + bonus_max.toString());
    }
    pool.getConnection()
        .then(function (conn) {
        conn.query(query)
            .then(function (table) {
            res.json({
                'data': JSON.stringify(table)
            });
            console.log(table);
        });
    });
});
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
exports["default"] = app;
