
const http = require('http'); //default node.js package already installed on node.js
const { request } = require('./app');
const debug = require('debug')('node-angular');
const app = require('./app');




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

