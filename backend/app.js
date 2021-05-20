
const express = require('express'); //import express
const app = express(); //important: app is just a chain of middleware. Funnel of functions that do things to the request. read values. manipulate...send responses etc
const cors = require('cors');
const checkAuth = require("./middleware/check-auth");


const disableAuth = false;
//JWT
const jwt = require('jsonwebtoken');

//MongoDB
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;

//const connectionString = "mongodb+srv://Dan:x6RTQn5bD79QLjkJ@cluster0.uljb3.gcp.mongodb.net/MBEdge?retryWrites=true&w=majority";
const connectionString = "mongodb+srv://Randy:4QQJnbscvoZQXr0l@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";
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
                            console.log("Creating new user profile with default settings");
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
                            console.log('Retrieve user Settings triggered... ');
                            // console.log(req.body.sub);
                            // console.log(response);
                            //where you get response of pre-existing user authenticate here.

                            //Dev Use
                            if(disableAuth){
                              res.status(201).json({token: 'iamAtoken', expiry: 3600 , userDetails: response});

                            } else {
                              //Production Use
                              authenticateUser(req.body.email, req.body.sub)
                              .then( generatedToken => {
                                console.log("authenicating User....");
                                console.log(generatedToken);
                                res.status(201).json({token: generatedToken.token, expiry: generatedToken.expires , userDetails: response});
                              });
                            }


                          }
                        } catch (e){ console.log("error at connection!: " + e);
                      } finally { console.log("Enter.....");}

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


      const collection =  client.db("MBEdge").collection("matches");
      const changeStream = collection.watch();

      changeStream.on('change', (next) => {
        var data = JSON.stringify(next.fullDocument);
        var msg = ("event: message\n" + "data: " + data + "\n\n");
          res.write(msg);
          //console.log(JSON.stringify(next.fullDocument) + "\n\n" );
        });
  });

  //View Table Matches => /api/matches

  //DEV MODE add in checkAuth
app.get('/api/matches', checkAuth, async(req, res) => {

    const cursor = await client.db("MBEdge").collection("matches").find().sort({"League": 1, "unixDateTimestamp":1});
    const matchesList = await cursor.toArray();
    let body = matchesList;
    res.status(200).json({body})

});
/////////////////////////////////////////////////////////////////////////////////////////
//                SAB ROUTES  Place in another folder                                 //
////////////////////////////////////////////////////////////////////////////////////////
//Get all SAB **TODO** Need to get all SABS with ObjectID of user Only.
app.get('/api/sab/sabs', async(req,res) => {
try{
  const filter = { "juId": req.query.juId }
  console.log("------Retrieved SAB------");
  console.log("ID: " + req.query.juId);
  const cursor = await client.db("JuicyClients").collection("juicy_users_sab").find(filter);
  console.log(cursor);
  const sabList = await cursor.toArray();
  let body = sabList;
  console.log(body);
  res.status(200).json({body})
  console.log("--------Retrieved!--------");
}catch(e){
  console.log(e);
}

});

//Create a SAB
//*TODO Append juicyID onto document for lookup at initialization
//DEV MODE add in checkAuth
app.post('/api/sab', checkAuth, async(req,res) => {

      const col = await client.db("JuicyClients").collection("juicy_users_sab");
      const result = await col.insertOne(req.body, function(error, response){
        if(!error){
          // console.log(req.body);
          console.log("Succesfully written to DB!");
          res.status(201).json({_id: response.insertedId});
        }else{
          console.log("Oooops, shit fucked up when writing to DB!  ");
          res.status(404).json({error});
        }
      });

});

app.put('/api/user/settings', async(req,res,next) => {

    console.log("Updating user settings...Some weird echo going on here");
    // console.log(req);
    const _id = new ObjectID(req.body.juicyId);
    // console.log(req.body);
    let filter = {"_id":_id};
    let options = {upsert: false}
    let update =  { $set: { "account":{
                                      "username": req.body.account.username,
                                      "firstName": req.body.account.firstName,
                                      "email": req.body.account.email,
                                      "lastName": req.body.account.lastName,
                                      "quote":req.body.account.quote,
                                      "password":"getRidOfThisField",
                                      },
                            "preferences": {
                                            "userPrefferedStakes":[
                                                                    req.body.preferences.userPrefferedStakes[0],
                                                                    req.body.preferences.userPrefferedStakes[1],
                                                                    req.body.preferences.userPrefferedStakes[2],
                                                                    req.body.preferences.userPrefferedStakes[3],
                                                                    req.body.preferences.userPrefferedStakes[4],
                                                                    req.body.preferences.userPrefferedStakes[5],
                                                                    req.body.preferences.userPrefferedStakes[6],
                                                                    req.body.preferences.userPrefferedStakes[7],
                                                                    req.body.preferences.userPrefferedStakes[8],
                                                                    req.body.preferences.userPrefferedStakes[9],
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

      const cursor = client.db("JuicyClients").collection("juicy_users")
                              .updateOne( filter, update, options, function(error,response){
                                 console.log("Updated!");
                                 res.status(201).json({ response: response});
                              });
});

//update SAB
app.put('/api/sab/:id', async(req,res,next) => {

    //write _id to "id": <value> when updating locally.
    console.log("UPDATING SAB");
    const _id = new ObjectID(req.params.id);
    const col = await client.db("JuicyClients").collection("juicy_users_sab");
    // console.log(req.body);
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
                              "isSettled": req.body.isSettled,
                              "id":_id,
                              "comment": req.body.comment }}, function(error,response){
                                                              console.log("Match Updated!");
                                                              res.status(201).json({response});
                                                            })


  }
);

//Delete SAB
//DEV MODE add in checkAuth
app.delete("/api/sab/:id", checkAuth, async(req,res,next) => {
  console.log('Deleting SAB...');
    console.log(req.params);
    const _id = new ObjectID(req.params.id);
    const col = await client.db("JuicyClients").collection("juicy_users_sab");
    col.deleteOne({ _id: _id}, function(error,response){
      if(response.deletedCount != 0){
        console.log("Completed! Deleted: " + response.deletedCount);
        res.status(201).json({deletedCount: response.deletedCount});
      } else {
        console.log("Failed to delete...");
        res.status(400).json({deletedCount: response.deletedCount})
      }
    });

});
//Uses upsert to create default userSettings, assigning userEmail.
//Recieves upsertID, finds newly inserted document, returns it to client.
async function authenticateUser(userEmail, userId){
  let pv_key = "ALK!838(KjlIj__+9129JAqjL110}23";
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
                                      "userPrefferedStakes":[100,80,60,50,40,20,10,10,5,1],
                                      "ftaOption":"brooks",
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
