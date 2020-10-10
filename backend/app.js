const express = require('express'); //import express

//add route to handle requests for a specific path
const app = express(); //important: app is just a chain of middleware. Funnel of functions that do things to the request. read values. manipulate...send responses etc

app.use((req, res, next) => {
  console.log('First middleware');
  next();                               //add next() to chain events
});

app.use((req , res, next) => {
  res.send('Hello from express!');    //if you're not using next() *** You NEED TO SEND BACK A RESPONSE. Otherwise you will get a TIMEOUT. send() method lets you send back a RESPONSE to the incoming request.
});

//need to export this in the module.exports object.
module.exports = app; //sends the constant app and all its middleware. import it to server.js
