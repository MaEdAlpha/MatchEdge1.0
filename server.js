//need to import http package from node.js
const app = require('./backend/app');
const http = require('http'); //default node.js package already installed on node.js
const debug = require('debug')('node-angular');



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
      console.error(bind + " require elevated privileges");
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

