import * as express from "express";
import {Request, Response} from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as pool from "./sql";
import { NextFunction } from "connect";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";

import { connect } from "net";
import { ResolveOptions } from "dns";
import { createDiffieHellman } from "crypto";
const app = express();
const port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({secret: "wyf and lxr NB!"}));

app.get('/login', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'html/login.html'));
});

app.get('/signup', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'html/signup.html'));
});

app.get('/api/login', (req: Request, res: Response) => {
  let username = req.query.username;
  let password = req.query.password;
  console.log(req.query.username);
  console.log(req.query.password);
  if (req.query.username === '' || req.query.password === '') {
    res.json({
      'msg': 'error, please input not empty username and password',
      'errno': -1
    });
    return;
  }

  pool.getConnection()
    .then(conn => {
      conn.query('select * from Account where username = ? and password = ?', [username, password])
        .then(rows => {
          // console.log(rows);
          // console.log(rows.length);
          req.session.user = 'root';
          conn.end();
          if (rows.length == 0) {
            res.json({
              error: 1,
              msg: 'error password or username'
            })
          } else {
            res.json({
              error: 0,
              msg: JSON.stringify(rows)
            });
          }
        })
        .catch(err => {
          console.log(err);
          conn.end();
          res.json({
            error: 1,
            msg: JSON.stringify(err)
          })
        })
    })
    .catch(err => {
      console.log(err);
      res.json({
        error: 2,
        msg: JSON.stringify(err)
      })
    });
})

app.get('/api/logout', (req: Request, res: Response) => {
  req.session.user = undefined;
  res.json({
    msg: 'ok',
    error: 0
  });
});

app.post('/api/signup', (req: Request, res: Response) => {
  let username = req.body.username;
  let password = req.body.password;
  pool.getConnection()
    .then(conn => {
      conn.query('insert into Account(username, password) value(?,?)', [username, password])
        .then(rows => {
          console.log(rows);
          res.json({
            msg: JSON.stringify(rows),
            error: 0
          });
          req.session.user = username;
        })
        .catch(err => {
          res.json({
            msg: JSON.stringify(err),
            error: 1
          });
        });
      conn.end();
    })
    .catch(err => {
      res.json({
        msg: JSON.stringify(err),
        error: 2
      });
    });
});

app.use('/query', (req: Request, res: Response, next : NextFunction) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }
  next();
});

app.get('/query', (req: Request, res: Response) => {
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
      return;
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

