
const express = require('express'); //import express
const app = express(); //important: app is just a chain of middleware. Funnel of functions that do things to the request. read values. manipulate...send responses etc
const cors = require('cors');
const checkAuth = require("./middleware/check-auth");

//JWT
const jwt = require('jsonwebtoken');

//MongoDB
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;

//const connectionString = "mongodb+srv://Dan:x6RTQn5bD79QLjkJ@cluster0.uljb3.gcp.mongodb.net/MBEdge?retryWrites=true&w=majority";
const connectionString = "mongodb+srv://Randy:l116vwyx9JMo5w9v@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";
const options = {useUnifiedTopology: true, useNewUrlParser: true};
const client = new MongoClient(connectionString, options );


async function connectDB(client){
  try {
    await client.connect({useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})
    .then((response) =>  { app.locals.db = response;   console.log('Connected to database!')})
    .catch(() => { console.log('Connection failed!');});
  } catch (e) {
    console.error(e);
  } finally {
  }
}

//connect to DB.
connectDB(client).catch(console.error);

///////////////////////////////  RESPONSE HEADER //////////////////////////////////////////////
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
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



/////////////////////////////////////////////////////////////////////////////////////////
//                              API TO BACKEND                                        //
////////////////////////////////////////////////////////////////////////////////////////
//Retrieves User Settings or generates a default one.

app.put(`/api/user/connect`, async (req,res) => {
  //upsert document. If new user, return _id. If not new user, find in database.
  const filter = {"account.email": req.body.email};


  //Return user Settings or Generate Default User settings for login if a new user.
  //Also generate and send back a token.
  client.db("JuicyClients")
    .collection("juicy_users")
        .findOne( filter, function(error,response){
                        try{
                          error ? console.log(error) : '';
                          // console.log(response);
                          //if null, create a new user.
                          if(response == null){
                            console.log("NEW USER DETECTED!!!");
                            //Create new document
                            createNewUserDocument( req.body.email).then( response => {
                              console.log(req.body.sub);
                              //where you get results of new user authenticate here.
                              authenticateUser(req.body.email, req.body.sub)
                              .then( generatedToken =>{
                                  res.status(201).json({token: generatedToken.token, expiry: generatedToken.expires, userDetails: response})
                                });

                            });

                          } else {
                            console.log(req.body.sub);
                            // console.log(response);
                            //where you get response of pre-existing user authenticate here.
                            authenticateUser(req.body.email, req.body.sub)
                            .then( generatedToken => {
                              console.log(generatedToken);
                              res.status(201).json({token: generatedToken.token, expiry: generatedToken.expires , userDetails: response});
                            });

                          }
                        } catch (e){ console.log("error at connection!: " + e);}
                      })
    });

    //Authentication
    //handle access to website. Find User. Have a boolean sent back, hasPaidSubscription?
    // if so, grant access tocken.
    //sub": "auth0|608513bd84219c0068259906" is the uid from auth0, and has a verified email.


/////////////////////////////////////////////////////////////////////////////////////////
//               INITIAL MATCHES AND STREAM DATA API                                  //
////////////////////////////////////////////////////////////////////////////////////////
//TODO: Authenticat UPDATES API Call. Need to pass token in here and assign to writeHead(200)
app.get(`/api/updates`, function(req, res) {

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

    try{
      const collection =  client.db("MBEdge").collection("matches");
      const changeStream = collection.watch();

      changeStream.on('change', (next) => {
        var data = JSON.stringify(next.fullDocument);
        var msg = ("event: message\n" + "data: " + data + "\n\n");
          res.write(msg);
          //console.log(JSON.stringify(next.fullDocument) + "\n\n" );
        });
      } catch (error){
      console.log(error);
    }
  });
  //View Table Matches => /api/matches
app.get('/api/matches', checkAuth, async(req, res) => {
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
/////////////////////////////////////////////////////////////////////////////////////////
//                SAB ROUTES  Place in another folder                                 //
////////////////////////////////////////////////////////////////////////////////////////
//Get all SAB **TODO** Need to get all SABS with ObjectID of user Only.
app.get('/api/sab/sabs', async(req,res) => {
  try{
    const filter = { "juId": req.query.juId }
    const cursor = await client.db("JuicyClients").collection("juicy_users_sab").find(filter);
    const sabList = await cursor.toArray();
    let body = sabList;
    console.log(body);
    res.status(200).json({body})
  } catch (e) {
    console.log(e);
  }
});

//Create a SAB
//*TODO Append juicyID onto document for lookup at initialization
app.post('/api/sab', checkAuth, async(req,res) => {

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

app.put('/api/user/settings', checkAuth, async(req,res,next) => {
  try {
    console.log("UserSettings.body");
    console.log(req.body);
    const _id = new ObjectID(req.body.juicyId);
    // const col = await client.db("JuicyClients").collection("juicy_users").findOne({"_id":_id}, function(error,response){
    //   console.log(response);
    // });
    let filter = {"_id":_id};
    let options = {upsert: false}
    let update =  { $set: { "account":{   "username": req.body.account.username,
                                      "firstName": req.body.account.firstName,
                                      "email": req.body.account.email,
                                      "lastName": req.body.account.lastName,
                                      "quote":req.body.account.quote,
                                      "password":"getRidOfThisField",
                                  },
                                  "preferences": {
                                    "userPrefferedStakes":[
                                                              {"stake":req.body.preferences.userPrefferedStakes[0], "oddsLow": 0.1, "oddsHigh":2.01},
                                                              {"stake":req.body.preferences.userPrefferedStakes[1], "oddsLow": 2.01, "oddsHigh":3},
                                                              {"stake":req.body.preferences.userPrefferedStakes[2], "oddsLow": 3.01, "oddsHigh":4},
                                                              {"stake":req.body.preferences.userPrefferedStakes[3], "oddsLow": 4.01, "oddsHigh":5},
                                                              {"stake":req.body.preferences.userPrefferedStakes[4], "oddsLow": 5.01, "oddsHigh":6},
                                                              {"stake":req.body.preferences.userPrefferedStakes[5], "oddsLow": 6.01, "oddsHigh":8},
                                                              {"stake":req.body.preferences.userPrefferedStakes[6], "oddsLow": 8.01, "oddsHigh":10},
                                                              {"stake":req.body.preferences.userPrefferedStakes[7], "oddsLow": 10.01, "oddsHigh":12},
                                                              {"stake":req.body.preferences.userPrefferedStakes[8], "oddsLow": 12.01, "oddsHigh":14},
                                                              {"stake":req.body.preferences.userPrefferedStakes[9], "oddsLow": 14.01, "oddsHigh":2000}
                                                          ],
                                    "ftaOption":req.body.preferences.ftaOption,
                                    "exchangeOption":{
                                                      "name":req.body.preferences.exchangeOption.name,
                                                      "commission":req.body.preferences.exchangeOption.commission,
                                                    }
                                    },
                                  "filters": {
                                    "timeRange":req.body.filters.timeRange,
                                    "minOdds":req.body.filters.minOdds ,
                                    "maxOdds":req.body.filters.maxOdds ,
                                    "evFVI":req.body.filters.evFVI,
                                    "evFVII":req.body.filters.evFVII,
                                    "mrFVI":req.body.filters.matchRatingFilterI,
                                    "mrFVII":req.body.filters.matchRatingFilterII,
                                    "ssFVI":req.body.filters.secretSauceI,
                                    "ssFVII":req.body.filters.secretSauceII,
                                    "fvSelected":req.body.filters.fvSelected,
                                    "audioEnabled":req.body.filters.audioEnabled,
                                    }
                                  }


    }

      client.db("JuicyClients").collection("juicy_users")
                              .updateOne( filter, update, options, function(error,response){
                                 console.log("Updated User Settings!");
                                 console.log("Modified: " + response.modifiedCount);
                              });

  }catch (e){
    console.log("User PUT request Error");
    console.log(e);
  }
})

//update SAB
app.put('/api/sab/:id', checkAuth, async(req,res,next) => {
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
app.delete("/api/sab/:id", checkAuth, async(req,res,next) => {
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
//Uses upsert to create default userSettings, assigning userEmail.
//Recieves upsertID, finds newly inserted document, returns it to client.
async function authenticateUser(userEmail, userId){
  let pv_key = "super_secret_key";
  let encodedData =  {email: userEmail, userId: userId };
  let options =  {expiresIn: "1h"};
  let expirationSeconds = 3600 //convert "1h" string into seconds
  const token =  await jwt.sign(encodedData, pv_key, options,);
  return {token: token, expires: expirationSeconds };
}

function createNewUserDocument(userEmail){
  //UpdateOne parameters
  const filter = {"account.email": userEmail}
  const options = { upsert:true };
  const update = { $set: { "account":{   "username":"JuicyUser",
                                        "firstName":"John",
                                        "lastName":"Doe",
                                        "email": userEmail,
                                        "quote":"Lalala",
                                        "password":"test",
                                     },
                            "preferences": {
                                      "userPrefferedStakes":[
                                                              {"stake":100, "oddsLow": 0.1, "oddsHigh":2.01},
                                                              {"stake":80, "oddsLow": 2.01, "oddsHigh":3},
                                                              {"stake":60, "oddsLow": 3.01, "oddsHigh":4},
                                                              {"stake":50, "oddsLow": 4.01, "oddsHigh":5},
                                                              {"stake":40, "oddsLow": 5.01, "oddsHigh":6},
                                                              {"stake":20, "oddsLow": 6.01, "oddsHigh":8},
                                                              {"stake":10, "oddsLow": 8.01, "oddsHigh":10},
                                                              {"stake":10, "oddsLow": 10.01, "oddsHigh":12},
                                                              {"stake":5, "oddsLow": 12.01, "oddsHigh":14},
                                                              {"stake":1, "oddsLow": 14.01, "oddsHigh":2000}
                                                            ],
                                      "ftaOption":"generic",
                                      "exchangeOption":{
                                                        "name":"Smarkets",
                                                        "commission":2,
                                                      }
                                      },
                            "filters": {
                                      "timeRange":"Today & Tomorrow",
                                      "minOdds": "2.5",
                                      "maxOdds": "20",
                                      "evFVI":"-20",
                                      "evFVII":"1",
                                      "mrFVI":"95",
                                      "mrFVII":"97",
                                      "ssFVI":"-1.5",
                                      "ssFVII":"-1.2",
                                      "fvSelected":1,
                                      "audioEnabled":true,
                                      }

                           }
                 }
  //Update -> use upsertedId._id to find document to return to user.
  return  new Promise(function(resolve,reject){
  client.db("JuicyClients").collection("juicy_users")
                              .updateOne( filter, update, options, function(error,response){
                                  console.log("UPDATED:!");
                                  console.log(response.upsertedId._id);
                                 resolve(client.db("JuicyClients").collection("juicy_users").findOne(filter));
                              });
                            });
}

  ////////////////////////////////////////////////////////// NOT IN USE ATM ////////////////////////////////////////////////////////
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
    });
  }
module.exports = app;
