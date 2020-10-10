//need to import http package from node.js
const http = require('http'); //default node.js package already installed on node.js
const app = require('./backend/app');

const port = process.env.PORT || 3000; //process.env dyanmically  variables part of node features. Always used for listening on ports

app.set('port', port);

//create a server constant (without app express. Example of the most basic server)

                          // const server = http.createServer((req, res) => {
                          //   res.end('My First Response');
                          // });

//create a server constant (with app express imports and used as an object in createServer() )
const server = http.createServer(app);

//set port you want to host server at. for now, we do localhost 3000
server.listen(port);


