const { match } = require('assert');
const express = require('express'); //import express
const mongoose = require('mongoose');

//add route to handle requests for a specific path
const app = express(); //important: app is just a chain of middleware. Funnel of functions that do things to the request. read values. manipulate...send responses etc

mongoose.connect("mongodb+srv://Randy:M7bkD0xFr91G0DfA@clusterme.lfzcj.mongodb.net/matchEdge?retryWrites=true&w=majority")
.then(() => {
  console.log('Conenected to database!')
})
.catch(() => {
  console.log('Connection failed!');
});

app.use('/api/matches', (req, res, next) => {
  match.find()
    .then(documents => {
      console.log(documents);
    });
  res.status(200).json({
    message: 'Data via node.js server',
    matches: matches
  });
});



//need to export this in the module.exports object.
module.exports = app; //sends the constant app and all its middleware. import it to server.js
