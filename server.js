//need to import http package from node.js
const http = require('http'); //default node.js package already installed on node.js

//create a server constant
const server = http.createServer((req, res) => {
  res.end('My First Response');
});

//set port you want to host server at. for now, we do localhost 3000
server.listen(process.env.PORT || 3000); //process.env dyanmically  variables part of node features. Always used for listening on ports


