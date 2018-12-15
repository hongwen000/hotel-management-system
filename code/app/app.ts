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

app.get('/api/query_user', (req: Request, res: Response)=>{
  let credential: string =  req.body.credential;
  let name: string = req.body.name;
  let gender: number = req.body.number;
  let phone: string = req.body.phone;
  let balance_min: number = req.body.balance_min;
  let balance_max: number = req.body.balance_max;
  let bonus_min: number = req.body.bonus_min;
  let bonus_max: number = req.body.bonus_max;
  let query: string = 'select * from User as u where 1 = 1';
  // 精确匹配证件号
  if(credential != '') {
    query.concat(' and u.credential = ' + credential);
  }
  // 模糊匹配姓名
  if(name != '') {
    query.concat(" and u.name LIKE'%"+ name +"%'")
  }
  if(gender != -1) {
    query.concat(" and u.gender = " + gender.toString());
  }
  if(phone != '') {
    query.concat(' and u.phone = ' + phone);
  }
  if(balance_min != -1) {
    query.concat(" and u.balance >= " + balance_min.toString());
  }
  if(balance_max != -1) {
    query.concat(" and u.balance <= " + balance_max.toString());
  }
  if(bonus_min != -1) {
    query.concat(" and u.bonus >= " + bonus_min.toString());
  }
  if(bonus_max != -1) {
    query.concat(" and u.bonus <= " + bonus_max.toString());
  }
  pool.getConnection()
    .then(conn=>{
      conn.query(query)
        .then((table)=>{
          res.json({
            'data': JSON.stringify(table)
          })
          console.log(table);
        })
    })

});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


export default app;