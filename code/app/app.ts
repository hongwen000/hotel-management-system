import * as express from "express";
import {Request, Response} from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as pool from "./sql";
import { createDiffieHellman } from "crypto";
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
  let query: string = 'select * from User as u where 1 = 1';
  // 精确匹配证件号
  if(credential != '') {
    query = query + (' and u.credential = ' + credential);
  }
  // 模糊匹配姓名
  if(name != '') {
    query = query + (" and u.name LIKE'%"+ name +"%'")
  }
  if(gender != '-1') {
    query = query + (" and u.gender = " + gender);
  }
  if(phone != '') {
    query = query + (' and u.phone = ' + phone);
  }
  if(balance_min != '') {
    query = query + (" and u.balance >= " + balance_min);
  }
  if(balance_max != '') {
    query = query + (" and u.balance <= " + balance_max);
  }
  if(bonus_min != '') {
    query = query + (" and u.bonus >= " + bonus_min);
  }
  if(bonus_max != '') {
    console.log("here")
    query = query + (" and u.bonus <= " + bonus_max);
  }
  console.debug(query);
  pool.getConnection()
    .then(conn=>{
      conn.query(query)
        .then((table)=>{
          for (let i = 0; i < table.length; ++i) {
            if(table[i].gender == 0) {
              table[i].gender = 'man';
            } else if (table[i].gender == 0) {
              table[i].gender = 'woman';
            }
            let birthdate: string = table[i].birthdate.toISOString();
            table[i].birthdate = birthdate.substr(0,10);
          }
          res.json({
            "users": JSON.stringify(table)
          })
        })
    }).catch(err => {
      console.log('ERROR' + err);
    })
});

app.all('/api/insert_user', (req: Request, res: Response)=>{
  let credential: string =  req.body.credential;
  let name: string = req.body.name;
  let gender: string = req.body.gender;
  let birthdate: string = req.body.birthdate;
  let phone: string = req.body.phone;
  let balance: string = req.body.string;
  let bonus: string = req.body.string;
  console.log(req.body)
  let query: string = `insert into User(credential, name, gender, birthdate, phone, bonus, balance)
    values(${credential}, ${name}, ${gender}, ${birthdate}, ${phone}, ${bonus}, ${balance})`;
  pool.getConnection()
    .then(conn=>{
      conn.query(query)
        .then((ret)=>{
          console.log(ret);
          res.json({
            "users": JSON.stringify(ret)
          })
        })
    }).catch(err => {
      console.log('ERROR' + err);
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


export default app;
