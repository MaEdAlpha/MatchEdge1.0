
const express = require('express'); //import express
const cors = require('cors');
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

//const connectionString = "mongodb+srv://Dan:x6RTQn5bD79QLjkJ@cluster0.uljb3.gcp.mongodb.net/MBEdge?retryWrites=true&w=majority";
const connectionString = "mongodb+srv://Randy:thaiMyShoe456@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";
const userRoutes = require("./routes/user");
const { response } = require('express');

const client = new MongoClient(connectionString, {useUnifiedTopology: true, useNewUrlParser: true});
const app = express(); //important: app is just a chain of middleware. Funnel of functions that do things to the request. read values. manipulate...send responses etc


async function connectDB(client){
  try {
    await client.connect( {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})
    .then(() =>  { console.log('Connected to database!')})
    .catch(() => { console.log('Connection failed!');});
    //testing purposes
    // await updateMatches(client);
    // await listDatabases(client);
    // await showMatches(client);
    // await showUsers(client);
  } catch (e) {
    console.error(e);
  } finally {
    // Do nothing.. do we need to close the client?
  }
}

connectDB(client).catch(console.error);
//Initialize changeStream for database

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
      );
      next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
    // Authorization middleware. When used, the



//development purposes
//testing DB calls:

/////////////////////////////////////////////////////////////////////////////////////////////////////
async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` ${db.name}`));

}

async function showMatches(client){
  console.log("ShowMatchesMethod");
  const cursor = await client.db("MBEdge").collection("matches").find();
  const query = await cursor.toArray();
  console.log(query);
  return query;
}

async function showUsers(client){
  console.log("JuicyUsers");
  const cursor = await client.db("JuicyClients").collection("juicy_users").find({});
  const query = await cursor.toArray();
  console.log(query);
}


async function populateDefaultSettings(client, userId, upsert){
  const filter = {"juicyId": userId};
  const options = { upsert:upsert };
  const update = { $set: { "account":{   "username":"upsert",
                                        "firstName":"upsert",
                                        "lastName":"upsert",
                                        "email": "test",
                                        "quote":"test",
                                        "password":"test",
                                     },
                            "preferences": {
                                      "userPrefferedStakes":[
                                                              {"stake":0, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0},
                                                              {"stake":9, "oddsLow": 0, "oddsHigh":0}
                                                            ],
                                      "ftaOption":"generic",
                                      "exchangeOption":{
                                                        "name":"Smarkets",
                                                        "commission":2,
                                                      }
                                      },
                            "filters": {
                                      "timeRange":"Today & Tomorrow",
                                      "mindOdds": "default",
                                      "maxOdds": "default",
                                      "evFVI":"-default",
                                      "evFVII":"default",
                                      "mrFVI":"default",
                                      "mrFVII":"default",
                                      "ssFVI":"-default",
                                      "ssFVII":"default",
                                      "fvSelected":1,
                                      "audioEnabled":false,
                                      }

                           }
                 }

  const cursor = await client.db("JuicyClients")
                              .collection("juicy_users")
                              .updateOne( filter, update, options, function(error,response){
                                  console.log("UPDATED:!");
                                  console.log(response.upsertedId._id);
                                  //FindOne with upsertedId and get base user settings? Or just have a default loaded side side....
                              });
}

function getUserSettings(juicyId, res) {
  const _juicyId = new ObjectID(juicyId);
  client.db("JuicyClients").collection("juicy_users").findOne({ "juicyId": _juicyId }, function (error, response) {
    res.status(201).json({ response });
    return response;
  });
}


async function updateMatches(client){
  const collection = client.db("MBEdge").collection("matches");
  const changeStream = collection.watch();
  changeStream.on('change', (next) => {
    console.log(next.fullDocument);
    //res.write( next + "\n\n" );
  });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//MongoStream connection
app.get(`/api/updates`,  function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const collection =  client.db("MBEdge").collection("matches");
  const changeStream = collection.watch();
  changeStream.on('change', (next) => {
    var data = JSON.stringify(next.fullDocument);
    var msg = ("event: message\n" + "data: " + data + "\n\n");
    res.write(msg);
    //console.log(JSON.stringify(next.fullDocument) + "\n\n" );
  });

});

/////////////////////////////////////////////////////////////////////////////////////////////////////
//Requests for matches SAB and user settings

//View Table Matches
app.get('/api/matches', async(req, res) => {
  try{
    const cursor = await client.db("MBEdge").collection("matches").find({});
    const matchesList = await cursor.toArray();
    let body = matchesList;
   res.status(200).json({body})
  } catch (e) {
    console.log(e);
    res.status(403).json({message:"Message to User"})
  }
});

//Connects based off auth0 email authentication
app.put(`/api/connect`, async (req,res) => {
  //upsert document. If new user, return _id. If not new user, find in database.
  const filter = {"email": req.body.email};
  const update = { $set: {"status" : 'valid' } };
  const options = { upsert:true };

  const cursor = await client.db("JuicyClients")
                             .collection("juicy_users_db")
                              .findOneAndUpdate( filter, update, options, function(error,response){
                                try{
                                  error ? console.log(error) : '';
                                  //if true, user is logging in for the first time. Create a user-settings document in DB
                                  if(response.value == null){
                                    console.log("NEW USER DETECTED!!!");
                                    //this is ObjectID of newly upserted document
                                    let body = response.lastErrorObject.upserted;
                                    let upsert = true;
                                    populateDefaultSettings(client, body, upsert);
                                    res.status(201).json({body});
                                    return body;
                                  } else {
                                    let juicyId = response.value._id;
                                    //pass into another function which returns all user settings.
                                    getUserSettings(juicyId, res);
                                  }
                                } catch (e){ console.log(e);}
                              });
});


//broken code.
app.get(`/api/user-settings`, async(req,res) => {
  try{
    const cursor = await client.db("JuicyClients").collection("juicy_users").findOne({id:userId}, function(error, response){
      console.log(response);
    });
    const settingsDoc = await cursor.toArray();
    let body = settingsDoc;
    if(body != undefined) {res.status(200).json({body})}
  } catch (e) {
    console.log(e);
  }
});


//Get all SAB **TODO** Need to get all SABS with ObjectID of user Only.
app.get('/api/user/sabs', async(req,res) => {
  try{
    const cursor = await client.db("JuicyClients").collection("juicy_users_sab").find({});
    const sabList = await cursor.toArray();
    let body = sabList;
    res.status(200).json({body})
  } catch (e) {
    console.log(e);
  }
});

//Create a SAB
app.post('/api/sab', async(req,res) => {

  try {
      const col = await client.db("JuicyClients").collection("juicy_users_sab");
      const result = await col.insertOne(req.body, function(error, response){
        if(!error){
          console.log("Succesfully written to DB!");
          res.status(201).json({_id: response.insertedId});
        }else{
          console.log("Oooops, shit fucked up when writing to DB!  ");
          res.status(404).json({error});
        }
      });
    }catch (e) {
    console.log(e);
  }
});

//update SAB
app.put('/api/sab/:id', async(req,res,next) => {
  try{
    //write _id to "id": <value> when updating locally.
    const _id = new ObjectID(req.params.id);
    const col = await client.db("JuicyClients").collection("juicy_users_sab");
    console.log(req.body);
    col.updateOne({ "_id": _id},
                  { "$set": {
                              "created": req.body.created,
                              "fixture": req.body.fixture,
                              "selection": req.body.selection,
                              "stake": req.body.stake,
                              "backOdd": req.body.backOdd,
                              "layOdd": req.body.layOdd,
                              "layStake": req.body.layStake,
                              "liability": req.body.liability,
                              "ev":req.body.ev,
                              "mr":req.body.mr,
                              "sauce":req.body.sauce,
                              "fta": req.body.fta,
                              "ql": req.body.ql,
                              "roi": req.body.roi,
                              "betState": req.body.betState,
                              "pl": req.body.pl,
                              "id":_id,
                              "comment": req.body.comment }}, function(error,response){
                                                              console.log(response);
                                                              res.status(201).json({response});
                                                            })
  }catch (e) {

  }
});

//Delete SAB
app.delete("/api/sab/:id", async(req,res,next) => {
  try{
    const _id = new ObjectID(req.params.id);
    const col = await client.db("JuicyClients").collection("juicy_users_sab");
    col.deleteOne({ _id: _id}, function(error,response){
      if(response.deletedCount != 0){
        res.status(201).json({deletedCount: response.deletedCount});
      } else {
        res.status(400).json({deletedCount: response.deletedCount})
      }
    });

  }catch (e){
    console.log("something went wrong when deleting");
  }
});

app.use("/api/user", userRoutes);

module.exports = app; //sends the constant app and all its middleware. import it to server.js



