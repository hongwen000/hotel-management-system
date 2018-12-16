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
          // console.log(table)
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
  let birthdate : string = req.body.birthdate;
  let phone: string = req.body.phone;
<<<<<<< HEAD
  // TODO:前端应该可以不用下面这两项？可以设置成默认值0吗
  let balance: string = req.body.balance;
  let bonus: string = req.body.bonus;
  console.log(req.body)


  let query: string =  'insert into User (credential, name, gender, birthdate, phone, balance, bonus) value (?, ?, ?, ?, ?, ?, ?);';
  // TODO: 没有处理输入值为空的情况
  let arg: string[] = [];
  arg.push(credential)
  arg.push(name)
  if (gender === 'man'){
    arg.push('0');
  }
  else if (gender === 'woman'){
    arg.push('1');
  }
  else {
    arg.push(undefined);
  }
  // arg.push(gender)
  arg.push(birthdate)
  arg.push(phone)
  arg.push(balance)
  arg.push(bonus)
  // match the credential
  // ...

  console.debug(arg)
=======
  let balance: string = req.body.balance;
  let bonus: string = req.body.bonus;
  console.log(req.body)
  let query: string = 'insert into User(credential, name, gender, birthdate, phone, bonus, balance) values(';
  if(credential != '') {
    query = query + "'" + credential + "',";
  } else {
    query = query + 'null,';
  }
  if(name != '') {
    query = query + "'" + name + "',";
  } else {
    query = query + 'null,';
  }
  if(gender != '') {
    query = query +  gender + ',';
  } else {
    query = query + 'null,';
  }
  if(birthdate != '') {
    query = query + "'" + birthdate + "',";
  } else {
    query = query + 'null,';
  }
  if(phone != '') {
    query = query + "'" + phone + "',";
  } else {
    query = query + 'null,';
  }
  if(bonus != '') {
    console.debug('here')
    query = query +  bonus + ',';
  } else {
    query = query + 'null,';
  }
  if(balance != '') {
    query = query +  balance +')';
  } else {
    query = query + 'null)';
  }
  console.log(query);

>>>>>>> 00bb1c17d35c3a1eead80bef5634950148213ccb
  pool.getConnection()
    .then(conn=>{
      conn.query(query, arg)
        .then((msg) => {
          console.log(msg);
          res.json({
            'error_code':0,
            'error_msg':undefined,
          })
      })
      .catch((error) => {
        console.log(error)
        res.json({
          'error_code':1,
          'error_msg': error,
        })
      });
      conn.end();
    })
    .catch((error) => {
      console.log(error)
      res.json({
        'error_code':1,
        'error_msg': error,
      })
    });
})

app.all('/api/insert_room_type', (req: Request, res: Response)=>{
  // console.log(req)
  let name: string =  req.body.name;
  let capacity: string  = req.body.capacity;
  let wifi: string  = req.body.wifi;
  let breakfast: string  = req.body.breakfast;

  console.log(req.body)

  let query: string =  'insert into RoomType (name, capacity, wifi,breakfast) value (?, ?, ?, ?);';
  // TODO: 没有处理输入值为空的情况
  let arg: string[] = [];
  try {
    if (name === undefined){
      throw "name is empty !!"
    }
    if (capacity === undefined){
      throw "capacity is empty !!"
    }
    if (wifi === undefined){
      throw "wifi is empty !!"
    }
    if (breakfast === undefined){
      throw "breakfast is empty !!"
    }
    arg.push(name);
    arg.push(capacity);
    arg.push(wifi);
    arg.push(breakfast);
    console.debug(arg)
    pool.getConnection()
    .then(conn=>{
      conn.query(query, arg)
        .then((msg) => {
          console.log(msg);
          res.json({
            'error_code':0,
            'error_msg':undefined,
          })
      })
      .catch((error) => {
        console.log(error)
        res.json({
          'error_code':1,
          // TODO: 错误信息不是字符串，可能需要改一下，如果输入重复的房型，如何让前端知道？
          'error_msg': error,
        })
      });
      conn.end();
    })
    .catch((error) => {
      console.log(error)
      res.json({
        'error_code':1,
        // TODO: 错误信息不是字符串，可能需要改一下
        'error_msg': error,
      })
    });
  } catch (error) {
    res.json({
      'error_code':1,
      'error_msg':error
    })
  }
})

app.all('/api/insert_room', (req: Request, res: Response)=>{
  // TODO:未测试，先做房型
  // console.log(req)
  let floor: string =  req.body.floor;
  let room_num: string = req.body.room_num;
  let price: string = req.body.price;

  console.log(req.body)


  let query: string =  'insert into Room (floor, room_num, price) value (?, ?, ?);';
  // TODO: 没有处理输入值为空的情况
  let arg: string[] = [];
  try {
    if (floor === undefined){
      throw "floor is empty !!"
    }
    if (room_num === undefined){
      throw "room_num is empty !!"
    }
    if (price === undefined){
      throw "price is empty !!"
    }
    arg.push(floor);
    arg.push(room_num);
    arg.push(price);
    console.debug(arg)
    pool.getConnection()
    .then(conn=>{
      conn.query(query, arg)
        .then((msg) => {
          console.log(msg);
          res.json({
            'error_code':0,
            'error_msg':undefined,
          })
      })
      .catch((error) => {
        console.log(error)
        res.json({
          'error_code':1,
          'error_msg': error,
        })
      });
      conn.end();
    })
    .catch((error) => {
      console.log(error)
      res.json({
        'error_code':1,
        'error_msg': error,
      })
    });

  } catch (error) {
    res.json({
      'error_code':1,
      'error_msg':error
    })
  }
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))


export default app;
