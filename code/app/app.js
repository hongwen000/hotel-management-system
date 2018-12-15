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
app.listen(port, function () { return console.log("Example app listening on port " + port + "!"); });
exports["default"] = app;
