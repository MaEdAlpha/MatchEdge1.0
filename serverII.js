//need to import http package from node.js
const express = require('express');
const app = express();
const http = require('http'); //default node.js package already installed on node.js
const debug = require('debug')('node-angular');
const WebSocket = require( "ws");
const fs = require('fs');
const MongoClient = require("mongodb").MongoClient;

const Match = require('./backend/models/match');

const connectionString = "mongodb+srv://Randy:M7bkD0xFr91G0DfA@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";
const client = new MongoClient(connectionString,
  { useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 2,
    promiseLibrary: global.Promise
  });

  client.connect().then( () => { console.log('Connected to DB!')}).catch(()=>{ console.log('Connection Failed!');});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Header", "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
});


app.get('/' , (req, res) => {
  res.send("Hi Ryan");
});


app.get('/api/matches', (req, res) => {
  Match.find().then(matches => {
    res.status(200).json({
    body: matches
    });
  });
});


const normalizePort = val => {
  var port = parseInt(val,10);

  if(isNaN(port)) {
    //name pipe
    return val;
  }

  if (port >=0){
    //port number
    return port;
  }

  return false;
};

const onError = error => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " require eleveated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || 3000); //process.env dyanmically  variables part of node features. Always used for listening on ports

app.set('port', port);

//create a server constant (with app express imports and used as an object in createServer() )
const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
//set port you want to host server at. for now, we do localhost 3000
server.listen(port);

const wss = new WebSocket.Server({ server: server });

//const connectionString = "mongodb+srv://Dan:x6RTQn5bD79QLjkJ@cluster0.uljb3.gcp.mongodb.net/MBEdge?retryWrites=true&w=majority";
const connectionString = "mongodb+srv://Randy:M7bkD0xFr91G0DfA@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";
const client = new MongoClient(connectionString,
  { useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 2,
    promiseLibrary: global.Promise
  });


wss.on('connection', function connection(ws) {

   console.log("A new Client Connected");
    client.connect() // TOD: this connect() is being called a second time, inefficient in code. need to re-structure this code with app.js file to call one connect.
    .then( ()  => {
        console.log('ChangeStream Init');
        const changeStream = client.db("MBEdge").collection("matches").watch();
        changeStream.on("change", next => {
          const doc = JSON.stringify(next.fullDocument);
          ws.send(doc);
        })
      }).catch( () => { console.log('Stream failed!');
    });

   // ws.send("Server.js: Weclome New Client!"); //this sends to websockets

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        ws.send('In server.js incoming(message) its, ' + message);
    });

    process.on('uncaughtException', function (err) {
      console.error((new Dat).toUTCString() + ' uncaughtException:' , err.message)
      console.error(err.stack)
    })
});
// create a server constant (without app express. Example of the most basic server)

                          // const server = http.createServer((req, res) => {
                          //   res.end('My First Response');
                          // });



                          // 'use strict';

                          // const express = require('express');
                          // const path = require('path');
                          // const { createServer } = require('http');

                          // const WebSocket = require('ws');

                          // const app = express();
                          // app.use(express.static(path.join(__dirname, '/public')));

                          // const server = createServer(app);
                          // const wss = new WebSocket.Server({ server });

                          // wss.on('connection', function (ws) {
                          //   const id = setInterval(function () {
                          //     ws.send(JSON.stringify(process.memoryUsage()), function () {
                          //       //
                          //       // Ignore errors.
                          //       //
                          //     });
                          //   }, 100);
                          //   console.log('started client interval');

                          //   ws.on('close', function () {
                          //     console.log('stopping client interval');
                          //     clearInterval(id);
                          //   });
                          // });

                          // server.listen(3000, function () {
                          //   console.log('Listening on http://localhost:3000');
                          // });
