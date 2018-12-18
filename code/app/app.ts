import * as express from "express";
import { Request, Response } from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as pool from "./sql";
import { NextFunction } from "connect";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";

import { connect } from "net";
import { ResolveOptions } from "dns";
import { createDiffieHellman } from "crypto";
import { strict } from "assert";
const app = express();
const port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({ secret: "wyf and lxr NB!" }));

app.get('/login', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'html/login.html'));
});

app.get('/signup', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'html/signup.html'));
});
app.get('/profile', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'html/profile.html'));
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
          req.session.user = username;
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
          res.json({
            error: 1,
            msg: JSON.stringify(err)
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log(err);
      res.json({
        error: 2,
        msg: JSON.stringify(err)
      });
    });
});

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
  let role = 3;
  pool.getConnection()
    .then(conn => {
      conn.query('insert into Account(username, password, role) value(?,?,?)', [username, password, role])
        .then(rows => {
          console.log(rows);
          res.json({
            msg: JSON.stringify(rows),
            error: 0
          });
          req.session.user = username;
          conn.end();
        })
        .catch(err => {
          res.json({
            msg: JSON.stringify(err),
            error: 1
          });
          conn.end();
        });
    })
    .catch(err => {
      res.json({
        msg: JSON.stringify(err),
        error: 2
      });
    });
});


app.get('/api/i', (req: Request, res: Response) => {
  let username = req.session.user;
  // let username = 'wyf';
  let usernames: string[] = [username];
  console.log(usernames);
  let query: string = "select id,role from Account where username = ?"
  pool.getConnection()
    .then(conn => {
      conn.query(query, usernames)
        .then((rows) => {
          console.log(rows)
          console.log(rows[0])
          // let user_id = row
          res.json({
            'user_id': rows[0]['id'],
            'role': rows[0]['role'],
            'username': username,
            'error_code': 0
          });
        })
        .catch(err => {
          res.json({
            'error_code': 1,
            'error_msg': JSON.stringify(err)
          });
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      res.json({
        'error_code': 1,
        'msg': JSON.stringify(err)
      })
    })
});

app.use('/query', (req: Request, res: Response, next: NextFunction) => {
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
    .then(conn => {
      conn.query(req.body.query)
        .then((rows) => {
          res.json({
            'data': JSON.stringify(rows),
            'error_code': 0
          });
        })
        .catch(err => {
          res.json({
            'data': JSON.stringify(`err in sql: ${err}`),
            'error_code': 1
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(() => {
      res.json({
        'data': JSON.stringify('ERROR, connection failed'),
        'error_code': 2
      });
      return;
    });
});

app.use('/static', express.static(path.join(__dirname, 'static/')));

app.all('/api/query_user', (req: Request, res: Response) => {
  let credential: string = req.body.credential;
  let name: string = req.body.name;
  let gender: string = req.body.gender;
  let phone: string = req.body.phone;
  let balance_min: string = req.body.balance_min;
  let balance_max: string = req.body.balance_max;
  let bonus_min: string = req.body.bonus_min;
  let bonus_max: string = req.body.bonus_max;
  console.log(req.body)
  let query: string = 'select * from User as u where 1=1';
  if (credential != '') {
    query = query + (" and u.credential LIKE'%" + credential + "%'")
  }
  if (name != '') {
    query = query + (" and u.name LIKE'%" + name + "%'")
  }
  if (gender != '-1') {
    query = query + (" and u.gender = " + gender);
  }
  if (phone != '') {
    query = query + (" and u.phone LIKE'%" + phone + "%'")
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
    console.log("here")
    query = query + (" and u.bonus <= " + bonus_max);
  }
  pool.getConnection()
    .then(conn => {
      conn.query(query)
        .then((table) => {
          for (let i = 0; i < table.length; ++i) {
            if (table[i].gender == 0) {
              table[i].gender = 'man';
            } else if (table[i].gender == 1) {
              table[i].gender = 'woman';
            }
            let birthdate: string = table[i].birthdate.toISOString();
            table[i].birthdate = birthdate.substr(0, 10);
          }
          res.json({
            "users": JSON.stringify(table)
          })
        })
        .catch(err => {
          res.json({
            'error_code': 1,
            'error_msg': JSON.stringify(err)
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
    })

});

app.all('/api/insert_user', (req: Request, res: Response) => {
  let credential: string = req.body.credential;
  let name: string = req.body.name;
  let gender: string = req.body.gender;
  let birthdate: string = req.body.birthdate;
  let phone: string = req.body.phone;
  let balance: string = req.body.balance;
  let bonus: string = req.body.bonus;
  console.log(req.body)
  let query: string = 'insert into User(credential, name, gender, birthdate, phone, bonus, balance) values(';
  if (credential != '') {
    query = query + "'" + credential + "',";
  } else {
    query = query + 'null,';
  }
  if (name != '') {
    query = query + "'" + name + "',";
  } else {
    query = query + 'null,';
  }
  if (gender != '') {
    query = query + gender + ',';
  } else {
    query = query + 'null,';
  }
  if (birthdate != '') {
    query = query + "'" + birthdate + "',";
  } else {
    query = query + 'null,';
  }
  if (phone != '') {
    query = query + "'" + phone + "',";
  } else {
    query = query + 'null,';
  }
  if (bonus != '') {
    console.debug('here')
    query = query + bonus + ',';
  } else {
    query = query + 'null,';
  }
  if (balance != '') {
    query = query + balance + ')';
  } else {
    query = query + 'null)';
  }
  console.log(query);

  pool.getConnection()
    .then(conn => {
      conn.query(query)
        .then((ret) => {
          console.log(ret);
          res.json({
            "error_code": 0,
            "error_msg": JSON.stringify(ret)
          })
        })
        .catch((error) => {
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': error,
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
      res.json({
        "error_code": 1,
        "error_msg": JSON.stringify(err)
      })
    })
});

app.all('/api/insert_room_type', (req: Request, res: Response) => {
  // console.log(req)
  let name: string = req.body.name;
  let capacity: string = req.body.capacity;
  let wifi: string = req.body.wifi;
  let breakfast: string = req.body.breakfast;

  console.log(req.body)

  let query: string = 'insert into RoomType (name, capacity, wifi,breakfast) value (?, ?, ?, ?);';
  let arg: string[] = [];
  try {
    if (name == '') {
      throw "name is empty !!"
    }
    if (capacity == '') {
      throw "capacity is empty !!"
    }
    if (wifi == '') {
      throw "wifi is empty !!"
    }
    if (breakfast == '') {
      throw "breakfast is empty !!"
    }
    arg.push(name);
    arg.push(capacity);
    arg.push(wifi);
    arg.push(breakfast);
    console.debug(arg)
    pool.getConnection()
      .then(conn => {
        conn.query(query, arg)
          .then((msg) => {
            console.log(msg);
            res.json({
              'error_code': 0,
              'error_msg': undefined,
            })
          })
          .catch((error) => {
            console.log(error)
            res.json({
              'error_code': 1,
              'error_msg': JSON.stringify(error),
            })
          })
          .finally(() => {
            conn.end();
          })
      })
      .catch((error) => {
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      });
  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
})

app.all('/api/insert_room', (req: Request, res: Response) => {
  let floor: string = req.body.floor;
  let room_num: string = req.body.room_num;
  let price: string = req.body.price;

  console.log(req.body)


  let query: string = 'insert into Room (floor, room_num, price) value (?, ?, ?);';
  let arg: string[] = [];
  try {
    if (floor == '') {
      throw "floor is empty !!"
    }
    if (room_num == '') {
      throw "room_num is empty !!"
    }
    if (price == '') {
      throw "price is empty !!"
    }
    arg.push(floor);
    arg.push(room_num);
    arg.push(price);
    console.debug(arg)
    pool.getConnection()
      .then(conn => {
        conn.query(query, arg)
          .then((msg) => {
            console.log(msg);
            res.json({
              'error_code': 0,
              'error_msg': undefined,
            })
          })
          .catch((error) => {
            console.log(error)
            res.json({
              'error_code': 1,
              'error_msg': JSON.stringify(error),
            })
          })
          .finally(() => {
            conn.end();
          })
      })
      .catch((error) => {
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      });

  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
})
// app.all('/api/query_user_info', (req: Request, res: Response) => {
//   let user_id: string = req.body.user_id;
//   console.log(req.body)
//   let query: string = 'select * from User as u.id = ?';
//   try {
//     if (user_id == '' || user_id == undefined) {
//       throw "user_id is empty or underfined!!"
//     }
//     pool.getConnection()
//       .then(conn => {
//         conn.query(query, user_id)
//           .then((ret) => {
//             console.log(ret);
//             ret.json({

//             })
//       })
//       .catch((error) =>{
//         console.log(error)
//         res.json({
//           'error_code': 1,
//           'error_msg': JSON.stringify(error),
//         })
//       });
//       conn.end();
//     })
//     .catch((error) => {
//       console.log(error)
//       res.json({
//         'error_code': 1,
//         'error_msg': JSON.stringify(error),
//       })
//     });
//   } catch (error) {
//     res.json({
//       'error_code': 1,
//       'error_msg': JSON.stringify(error)
//     })
//   }
// })
app.all('/api/query_user_info', (req: Request, res: Response) => {
  let user_id: number = parseInt(req.body.user_id);
  console.log(user_id)
  let query: string = 'select * from User as u where u.id = ?';
  try {
    if (user_id == undefined) {
      throw "user_id is empty or underfined!!"
    }
    pool.getConnection()
      .then(conn => {
        conn.query(query, user_id)
          .then((table) => {
            console.log(table);
            if (table.length != 1) {
              throw ("Result contains zero or more than one row")
            }
            for (let i = 0; i < table.length; ++i) {
              if (table[i].gender == 0) {
                table[i].gender = 'man';
              } else if (table[i].gender == 0) {
                table[i].gender = 'woman';
              }
              let birthdate: string = table[i].birthdate.toISOString();
              table[i].birthdate = birthdate.substr(0, 10);
            }
            res.json({
              'id': table[0].id,
              'credential': table[0].credential,
              'name': table[0].name,
              'gender': table[0].gender,
              'birthdate': table[0].birthdate,
              'phone': table[0].phone,
              'balance': table[0].balance,
              'bonus': table[0].bonus
            })
          })
          .catch((error) => {
            console.log(error)
            res.json({
              'error_code': 1,
              'error_msg': JSON.stringify(error),
            })
          })
          .finally(() => {
            conn.end();
          })
      })
      .catch((error) => {
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      });
  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
});

app.get('/api/get_room_type', (req: Request, res: Response) => {
  let query = 'select * from RoomType'
  pool.getConnection()
    .then(conn => {
      conn.query(query)
        .then((table) => {
          // for (let i = 0; i < table.length; ++i) {
          //   if (table[i].gender == 0) {
          //     table[i].gender = 'man';
          //   } else if (table[i].gender == 0) {
          //     table[i].gender = 'woman';
          //   }
          //   let birthdate: string = table[i].birthdate.toISOString();
          //   table[i].birthdate = birthdate.substr(0, 10);
          // }
          res.json({
            "types": JSON.stringify(table)
          })
        })
        .finally(() => {
          conn.end();
        })
    }).catch(err => {
      console.log('ERROR' + err);
    })
});

app.all('/api/query_order_detail', (req:Request, res: Response) => {
  
});

app.all('/api/query_order_by_user', (req: Request, res: Response) => {
  let user_id: number = parseInt(req.body.user_id);
  console.log(req.body)
  let query: string = 'select * from `Order` as o where o.user_id = ?';
  let ret_obj:JSON;
  try {
    if (user_id == undefined) {
      throw "user_id is empty or underfined!!"
    }
    pool.getConnection()
      .then(conn => {
        conn.query(query, user_id)
          .then((ret) => {
            ret_obj = ret;
            console.log(JSON.stringify(ret))
            res.json({
              "orders": JSON.stringify(ret)
            })
      })
      .catch((error) =>{
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      })
      .finally(()=>{
        console.log("finally: ");
        console.log(ret_obj)
        conn.end();
      });
    })
    .catch((error) => {
      console.log(error)
      res.json({
        'error_code': 1,
        'error_msg': JSON.stringify(error),
      })
    })
  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
})
app.all('/api/query_order_details', (req: Request, res: Response) => {
  let order_id: number = parseInt(req.body.order_id);
  console.log(req.body)
  let query: string = 'select * from Operation as op where op.order_id = ?';
  try {
    if (order_id == undefined) {
      throw "order_id is empty or underfined!!"
    }
    pool.getConnection()
      .then(conn => {
        conn.query(query, order_id)
          .then((ret) => {
            console.log(JSON.stringify(ret))
            res.json({
              "op": JSON.stringify(ret)
            })
      })
      .catch((error) =>{
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      })
      .finally(()=>{
        console.log("finally: ");
        conn.end();
      });
    })
    .catch((error) => {
      console.log(error)
      res.json({
        'error_code': 1,
        'error_msg': JSON.stringify(error),
      })
    })
  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
})



app.all('/api/query_order', (req: Request, res: Response) => {
  let order_id: string = req.body.order_id;
  let time_min: string = req.body.time_min;
  let time_max: string = req.body.time_max;
  let floor: string = req.body.floor;
  let room_num: string = req.body.room_num;
  let user_id: string = req.body.user_id;
  let name : string = req.body.name

  console.log(req.body)
  let query: string = 'select O.id, check_in, check_out, user_id, U.name, room_id, room_num, status from `Order` as O, User as U, Room as R where O.room_id = R.id and O.user_id = U.id and O.id like ? and check_in >= ? and check_out <= ? and floor like ?  and room_num like ? and user_id like ? and U.name like ?  ;';
  let arg : string[] = ['%', '-1', 'null', '%', '%', '%', '%'];
  console.log(arg)
  if (order_id != '') {
    arg[0] = order_id;
  }
  if (time_min != ''){
    arg[1] = time_min;
  }
  if (time_max != ''){
    arg[2] = time_max;
  }
  if (floor != ''){
    arg[3] = floor;
  }
  if (room_num != ''){
    arg[4] = room_num;
  }
  if (user_id != ''){
    arg[5] = user_id;
  }
  if (name != ''){
    arg[6] = name;
  }
 console.log(arg)
  pool.getConnection()
    .then(conn => {
      conn.query(query, arg)
        .then((table) => {
          // for (let i = 0; i < table.length; ++i) {
          //   if (table[i].gender == 0) {
          //     table[i].gender = 'man';
          //   } else if (table[i].gender == 0) {
          //     table[i].gender = 'woman';
          //   }
          //   let birthdate: string = table[i].birthdate.toISOString();
          //   table[i].birthdate = birthdate.substr(0, 10);
          // }
          res.json({
            "orders": JSON.stringify(table),
            'error_code': 0,
            'error_msg': 'ok'
          })
        })
        .catch(err => {
          res.json({
            'error_code': 1,
            'error_msg': JSON.stringify(err)
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
    })
});


app.all('/api/query_order_operations', (req: Request, res: Response) => {
  let order_id: string = req.body.order_id;

  console.log(req.body)
  let query: string = 'select id, time, detail from Operation where order_id like ?';
  let arg : string[] = [];
  try {
    if (order_id == '') {
      throw "order_id is empty or underfined!!"
    }
    arg.push(order_id)
    pool.getConnection()
      .then(conn => {
        conn.query(query, arg)
        .then((table) => {
          // for (let i = 0; i < table.length; ++i) {
          //   if (table[i].gender == 0) {
          //     table[i].gender = 'man';
          //   } else if (table[i].gender == 0) {
          //     table[i].gender = 'woman';
          //   }
          //   let birthdate: string = table[i].birthdate.toISOString();
          //   table[i].birthdate = birthdate.substr(0, 10);
          // }
          res.json({
            "orders": JSON.stringify(table),
            'error_code': 0,
            'error_msg': 'ok'
          })
        })
        .finally(()=>{
          conn.end();
        });
      })
      .catch((error) =>{
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      })
  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
})



app.all('/api/cancel_order', (req: Request, res: Response) => {
  let order_id: string = req.body.order_id;

  console.log(req.body)
  let query: string = 'update `Order` as O set status = 0 where O.id = ? ';
  let query2 : string = 'insert into Operation(time, detail, order_id) value (now(), 2, ? );'
  let arg : string[] = []
  try {
    if (order_id == '') {
      throw "order_id is empty or underfined!!"
    }
    arg.push(order_id)
    pool.getConnection()
      .then(conn => {
        conn.query(query, arg)
        .catch((error) =>{
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': JSON.stringify(error),
          })
        })
        .finally(()=>{
          conn.end();
        });
      })
      .catch((error) =>{
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      })
    pool.getConnection()
      .then(conn => {
        conn.query(query2, arg)
        .then((ret) => {
          res.json({
            'error_code': 0,
            'error_msg': 'ok'
          })
        })
        .catch((error) =>{
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': JSON.stringify(error),
          })
        })
        .finally(()=>{
          conn.end();
        });
      })
      .catch((error) =>{
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      })
  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
})



app.all('/api/query_avail_room', (req: Request, res: Response) => {
  let check_in: string = req.body.check_in;
  let check_out: string = req.body.check_out;
  let capacity: string = req.body.capacity;
  let wifi: string = req.body.wifi;
  let breakfast: string = req.body.breakfast;

  console.log(req.body)
  let query: string = ' select R.id,R.floor, R.room_num,R.price, T.breakfast, T.wifi ,T.name, T.capacity from Room as R, RoomType as T where R.type_id = T.id and T.capacity >= ? and T.wifi like ? and T.breakfast like ? and not exists ( select room_id, O.id from `Order` as O where status = 1 and ((O.check_in <= ? and O.check_out >= ?) or (O.check_in <= ? and O.check_out >= ?)) and O.room_id = R.id );';
  // [capacity, wifi, breakfast, check_in check_in check_out check_out]
  let arg : string[] = [ '-1', '%', '%', '-1', 'null', '-1', 'null']
  try {
    if (capacity != ''){
      arg[0] = capacity;
    }
    if (wifi != ''){
      arg[1] = wifi;
    }
    if (breakfast != ''){
      arg[2] = breakfast;
    }
    if (check_in != '') {
      arg[3] = check_in;
      arg[4] = check_in;
    }
    if (check_out != ''){
      arg[5] = check_out;
      arg[6] = check_out;
    }
    pool.getConnection()
      .then(conn => {
        conn.query(query, arg)
        .then((table) => {
          for (let i = 0; i < table.length; ++i) {
            if (table[i].wifi == 0) {
              table[i].wifi = 'No';
            } else if (table[i].wifi == 1) {
              table[i].wifi = 'Yes';
            }
            if (table[i].breakfast == 0) {
              table[i].breakfast = 'No';
            } else if (table[i].breakfast == 1) {
              table[i].breakfast = 'Yes';
            } 
          }
          res.json({
            "orders": JSON.stringify(table),
            'error_code': 0,
            'error_msg': 'ok'
          })
        })
        .finally(()=>{
          conn.end();
        });
      })
      .catch((error) =>{
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      })
  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
})



app.all('/api/order_room', (req: Request, res: Response) => {
  let room_id: string = req.body.room_id;
  let user_id: string = req.body.user_id;
  let check_in: string = req.body.check_in;
  let check_out: string = req.body.check_out;

  console.log(req.body)


  let query: string = 'insert into `Order` (room_id, user_id, check_in, check_out, status) value (?, ?, ?, ?, 1);';
  let arg: string[] = [];
  try {
    if (room_id == '') {
      throw "room_id is empty !!"
    }
    if (user_id == '') {
      throw "user_id is empty !!"
    }
    if (check_in == '') {
      throw "check_in is empty !!"
    }
    if (check_out == '') {
      throw "check_out is empty !!"
    }
    arg.push(room_id);
    arg.push(user_id);
    arg.push(check_in);
    arg.push(check_out);
    console.debug(arg)
    pool.getConnection()
      .then(conn => {
        conn.query(query, arg)
          .then((msg) => {
            console.log(msg);
            res.json({
              'error_code': 0,
              'error_msg': 'ok',
            })
          })
          .catch((error) => {
            console.log(error)
            res.json({
              'error_code': 1,
              'error_msg': JSON.stringify(error),
            })
          })
          .finally(() => {
            conn.end();
          })
      })
      .catch((error) => {
        console.log(error)
        res.json({
          'error_code': 1,
          'error_msg': JSON.stringify(error),
        })
      });

  } catch (error) {
    res.json({
      'error_code': 1,
      'error_msg': JSON.stringify(error)
    })
  }
})

app.all('/api/alter_user_info', (req: Request, res: Response) => {
  let user_id: number = parseInt(req.body.user_id);
  let credential: string = req.body.credential;
  let name: string = req.body.name;
  let gender: number = parseInt(req.body.gender);
  let birthdate: string = req.body.birthdate;
  let phone: string = req.body.phone;
  let balance: number = parseInt(req.body.balance);
  let bonus: number = parseInt(req.body.bonus);
  console.log(req.body)
  let query: string = 'update User set credential = ?, name = ?, gender = ?, birthdate = ?, phone = ?, balance = ?, bonus = ? where id = ?' ;
  let arg = [credential, name, gender, birthdate, phone, balance, bonus, user_id];
  pool.getConnection()
    .then(conn => {
      conn.query(query, arg)
        .then((ret) => {
          console.log(ret);
          res.json({
            "error_code": 0,
            "error_msg": JSON.stringify(ret)
          })
        })
        .catch((error) => {
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': error,
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
      res.json({
        "error_code": 1,
        "error_msg": JSON.stringify(err)
      })
    });
})

app.all('/api/alter_room_type', (req: Request, res: Response) => {
  let type_id: number = parseInt(req.body.type_id);
  let name: string = req.body.name;
  let capacity: number = parseInt(req.body.capacity);
  let wifi: number = parseInt(req.body.wifi);
  let breakfast: number = parseInt(req.body.breakfast);
  console.log(req.body)
  let query: string = 'update RoomType set name = ?, capacity = ?, wifi = ?, breakfast = ? where id = ?';
  let arg = [name, capacity, wifi, breakfast, type_id];
  pool.getConnection()
    .then(conn => {
      conn.query(query, arg)
        .then((ret) => {
          console.log(ret);
          res.json({
            "error_code": 0,
            "error_msg": JSON.stringify(ret)
          })
        })
        .catch((error) => {
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': error,
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
      res.json({
        "error_code": 1,
        "error_msg": JSON.stringify(err)
      })
    });
})

app.all('/api/alter_room', (req: Request, res: Response) => {
  let room_id: number = parseInt(req.body.room_id);
  let floor: string = req.body.floor;
  let room_num: string = req.body.room_num;
  let price: number = parseInt(req.body.price);
  let type_id: number = parseInt(req.body.type_id);
  console.log(req.body)
  let query: string = 'update Room set floor = ?, room_num = ?, price = ?, type_id = ? where id = ?';
  let arg = [floor, room_num, price, type_id, room_id];
  pool.getConnection()
    .then(conn => {
      conn.query(query, arg)
        .then((ret) => {
          console.log(ret);
          res.json({
            "error_code": 0,
            "error_msg": JSON.stringify(ret)
          })
        })
        .catch((error) => {
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': error,
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
      res.json({
        "error_code": 1,
        "error_msg": JSON.stringify(err)
      })
    });
})


app.all('/api/drop_room', (req: Request, res: Response) => {
  let room_id: number = parseInt(req.body.room_id);
  console.log(req.body)
  let query: string = 'delete from Room where id = ?';
  let arg = [room_id];
  pool.getConnection()
    .then(conn => {
      conn.query(query, arg)
        .then((ret) => {
          console.log(ret);
          res.json({
            "error_code": 0,
            "error_msg": JSON.stringify(ret)
          })
        })
        .catch((error) => {
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': error,
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
      res.json({
        "error_code": 1,
        "error_msg": JSON.stringify(err)
      })
    });
})

app.all('/api/drop_user', (req: Request, res: Response) => {
  let user_id: number = parseInt(req.body.user_id);
  console.log(req.body)
  let query: string = 'delete from Room where id = ?';
  let arg = [user_id];
  pool.getConnection()
    .then(conn => {
      conn.query(query, arg)
        .then((ret) => {
          console.log(ret);
          res.json({
            "error_code": 0,
            "error_msg": JSON.stringify(ret)
          })
        })
        .catch((error) => {
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': error,
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
      res.json({
        "error_code": 1,
        "error_msg": JSON.stringify(err)
      })
    });
})

app.all('/api/drop_room_type', (req: Request, res: Response) => {
  let type_id: number = parseInt(req.body.type_id);
  console.log(req.body)
  let query: string = 'delete from Room where id = ?';
  let arg = [type_id];
  pool.getConnection()
    .then(conn => {
      conn.query(query, arg)
        .then((ret) => {
          console.log(ret);
          res.json({
            "error_code": 0,
            "error_msg": JSON.stringify(ret)
          })
        })
        .catch((error) => {
          console.log(error)
          res.json({
            'error_code': 1,
            'error_msg': error,
          })
        })
        .finally(() => {
          conn.end();
        })
    })
    .catch(err => {
      console.log('ERROR' + err);
      res.json({
        "error_code": 1,
        "error_msg": JSON.stringify(err)
      })
    });
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


export default app;