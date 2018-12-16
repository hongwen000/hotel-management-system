import * as express from "express";
import {Request, Response} from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as pool from "./sql";
const app = express();
const port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'html/index.html'));
})

app.all('/api/query', (req: Request, res: Response) => {
  pool.getConnection()
    .then(conn=>{
      conn.query(req.body.query)
        .then((rows) => {
          res.json({
            'data': rows
          });
        })
        .catch(err=>{
          res.json({
            'data': `err in sql: ${err}`
          })
        })
      conn.end();
    })
    .catch(()=>{
      res.json({
        'data': 'ERROR, connection failed'
      });
    });
});

app.use('/static', express.static(path.join(__dirname, 'static/')));

app.all('/api/query_user', (req: Request, res: Response)=>{
  let credential: string =  req.body.credential;
  let name: string = req.body.name;
  let gender: string = req.body.gender;
  let phone: string = req.body.phone;
  let balance_min: string = req.body.balance_min;
  let balance_max: string = req.body.balance_max;
  let bonus_min: string = req.body.bonus_min;
  let bonus_max: string = req.body.bonus_max;
  console.log(req.body)
  let query: string = 'select * from User as u where ? and ? and ? and ? and ? and ? and ? and ?';
  let arg: string[] = [];
  // 精确匹配证件号
  if(credential != '') {
    arg.push('u.credential = ' + credential);
  } else {
    arg.push('1=1');
  }
  // 模糊匹配姓名
  if(name != '') {
    arg.push("u.name LIKE'%"+ name +"%'")
  } else {
    arg.push('1=1');
  }
  if(gender != '-1') {
    arg.push("u.gender = " + gender);
  } else {
    arg.push('1=1');
  }
  if(phone != '') {
    arg.push('u.phone = ' + phone);
  } else {
    arg.push('1=1');
  }
  if(balance_min != '') {
    arg.push("u.balance >= " + balance_min);
  } else {
    arg.push('1=1');
  }
  if(balance_max != '') {
    arg.push("u.balance <= " + balance_max);
  } else {
    arg.push('1=1');
  }
  if(bonus_min != '') {
    arg.push("u.bonus >= " + bonus_min);
  } else {
    arg.push('1=1');
  }
  if(bonus_max != '') {
    arg.push("u.bonus <= " + bonus_max);
  } else {
    arg.push('1=1');
  }
  console.debug(arg)
  pool.getConnection()
    .then(conn=>{
      conn.query(query, arg)
        .then((table)=>{
          res.json({
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
                    "id":"XXXX",
                    "credential":"XXXXX",
                    "name":"XXXX",
                    "gender":-1,
                    "birthday":"2018-01-01",
                    "phone":"13534343434",
                    "balance":45,
                    "bonus":100
                }
              ]
          })
          // Not working
          for (let val in table) {
            console.log(val);
          }
          table.array.forEach(element => {
            console.log(element)
          });
        })
    })

});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


export default app;