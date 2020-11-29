
const express = require('express'); //import express
const app = express(); //important: app is just a chain of middleware. Funnel of functions that do things to the request. read values. manipulate...send responses etc
const mongoose = require('mongoose');
const fs = require('fs');

const Match = require('./models/match');
const connectionString = "mongodb+srv://Randy:M7bkD0xFr91G0DfA@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";
// const connectionString = "mongodb+srv://Dan:x6RTQn5bD79QLjkJ@cluster0.uljb3.gcp.mongodb.net/MBEdge?retryWrites=true&w=majority";


//add route to handle requests for a specific path
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})
.then(() =>  { console.log('Conenected to database!')})
.catch(() => { console.log('Connection failed!');});

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



// //need to export this in the module.exports object.
    module.exports = app; //sends the constant app and all its middleware. import it to server.js




