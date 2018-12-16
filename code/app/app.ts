import * as express from "express";
import {Request, Response} from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as pool from "./sql";
import { connect } from "net";
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
          console.log(table)
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
      conn.end();
    }).catch(err => {
      console.log('ERROR' + err);
    })

});


app.all('/api/insert_user', (req: Request, res: Response)=>{
  // console.log(req)
  let credential: string =  req.body.credential;
  let name: string = req.body.name;
  let gender: string = req.body.gender;
  let phone: string = req.body.phone;
  let birthdate : string = req.body.birthdate;
  // TODO:前端应该可以不用下面这两项？可以设置成默认值0吗
  let balance: string = req.body.balance;
  let bonus: string = req.body.bonus;
  console.log(req.body)


  let query: string =  'insert into Hotel.User(credential, name, gender, birthdate, phone, balance, bonus) values (?, ?, ?, ?, ?, ?,?);';
  // TODO: 构造arg列表
  let arg: string[] = [];
  arg.push(credential)
  arg.push(name)
  arg.push(gender)
  arg.push(phone)
  arg.push(birthdate)
  arg.push(balance)
  arg.push(bonus)
  // match the credential
  // ...

  console.debug(arg)
  pool.getConnection()
    .then(conn=>{
      conn.query(query, arg)
        .then((res) => {
          console.log(res);
          conn.end();
      })
      .catch((err) => {
        // TODO: handle the error
        conn.end();
      })
    })
    .catch((error) => {
      // TODO: handle the error
    });
  
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


export default app;
