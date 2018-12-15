var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var pool = require('./sql');
var app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname, 'html/index.html'));
});

app.all('/api/query', function(req, res) {
    pool.getConnection()
        .then(conn => {
            conn.query(req.body.query)
                .then((rows) => {
                    res.json({
                        'data': rows
                    });
                })
                .catch(err => {
                    res.json({
                        'data': `error in sql: ${err}`
                    });
                });
            conn.end();
        })
        .catch(() => {
            res.json({
                'data': 'ERROR, connection failed'
            });
        });
});

app.use('/static', express.static(path.join(__dirname, 'static/')));
app.listen(port, () => console.log(`Example app listening on port ${port}!`))