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
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


export default app;