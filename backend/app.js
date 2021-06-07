
const express = require('express');
const app = express();
const cors = require('cors');
const checkAuth = require("./middleware/check-auth");
const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", '*');
  // res.setHeader("Access-Control-Allow-Header", 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  //   res.setHeader("Access-Control-Allow-Methods",'GET, PUT, POST, PATCH, DELETE, OPTIONS');
  //     next();
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    // Set to true if you need the website to include cookies in the requests sent
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/////////////////////////////////////////////////////////////////////////////////////////
//                              API TO BACKEND                                        //
////////////////////////////////////////////////////////////////////////////////////////
//Retrieves User Settings or generates a default one.

app.get('/api/test', async (req,res)=>{
  res.status(200).json({message:"Works"})
});

app.put('/api/user/putcreate' , async (req,res)=>{
  createNewUserDocument("testing@mongodb.com").then(()=> {
    res.status(200).json({message:"CheckDatabase"});
  })
});

app.post('/api/user/postcreate' , async (req,res)=>{
  createNewUserDocument("testing@mongodb.com").then(()=> {
    res.status(200).json({message:"CheckDatabase"});
  })
});

app.put('/api/user/connect', async (req,res) => {
  //upsert document. If new user, return _id. If not new user, find in database.
  const filter = {"account.email": req.body.email};
  //Upon auth0 authentication, return user settings or generate default user settings + generate and send back token
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
                                      res.status(200).json({token: generatedToken.token, expiry: generatedToken.expires, userDetails: response})
                                    });

                                });

                              } else {
                                console.log('Retrieve user Settings triggered... ');
                                  //Production Use
                                  authenticateUser(req.body.email, req.body.sub)
                                  .then( generatedToken => {
                                    console.log("authenicating User....");
                                    console.log(generatedToken);
                                    res.status(200).json({token: generatedToken.token, expiry: generatedToken.expires , userDetails: response});
                                  });
                              }
                        } catch (e){ res.status(300).json({token: "Error retrieving user details"});
                      } finally { console.log("Enter.....");}

                      })
    });

/////////////////////////////////////////////////////////////////////////////////////////
//               INITIAL MATCHES AND STREAM DATA API                                  //
////////////////////////////////////////////////////////////////////////////////////////
//TODO: Authenticat UPDATES API Call. Need to pass token in here and assign to writeHead(200)
app.get(`/api/updates`, function(req, res) {
  //'X-Accel-Buffering': turns off server buffering for SSE to work
  //PRODUCTION CORS : 'https://juicy-bets.com'
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

      //point to matches collection and watch it.
      const collection =  client.db("MBEdge").collection("matches");
      const changeStream = collection.watch();

      let keepAliveMS = 45 * 1000;

      function keepAlive(){
         console.log("HeartBeater");
         res.write("event:message\n"+ "data: hearbeat\n\n");
         setTimeout(keepAlive, keepAliveMS);
        }
        //send SSE events back to user
        changeStream.on('change', (next) => {
          var data = JSON.stringify(next.fullDocument);
          var msg = ("event: message\n" + "data: " + data + "\n\n");
          res.write(msg);
        });
        setTimeout(keepAlive, keepAliveMS);

  });

  //View Table Matches => /api/matches

  //DEV MODE add in checkAuth
app.get('/api/matches', checkAuth, async(req, res) => {

    const cursor = await client.db("MBEdge").collection("matches").find().sort({"League": 1, "unixDateTimestamp":1});
    const matchesList = await cursor.toArray();
    let body = matchesList;
    res.status(200).json({body})
});
//////////////////////////////////////////////////////////////////////////////////////////
//                                  SAB ROUTES                                         //
////////////////////////////////////////////////////////////////////////////////////////

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
    }
    catch(e){
    console.log(e);
    }
});

//Create a SAB
app.post('/api/sab', checkAuth, async(req,res) => {

      const col = await client.db("JuicyClients").collection("juicy_users_sab");
      const result = await col.insertOne(req.body, function(error, response){
        if(!error){
          console.log("Succesfully written to DB!");
          res.status(200).json({_id: response.insertedId});
        }else{
          console.log("Oooops, shit fucked up when writing to DB contact support, Cheers.  ");
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
                                 res.status(200).json({ response: response});
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
app.delete("/api/sab/:id", checkAuth, async(req,res,next) => {
  console.log('Deleting SAB...');
    console.log(req.params);
    const _id = new ObjectID(req.params.id);
    const col = await client.db("JuicyClients").collection("juicy_users_sab");
    col.deleteOne({ _id: _id}, function(error,response){
      if(response.deletedCount != 0){
        console.log("Completed! Deleted: " + response.deletedCount);
        res.status(200).json({deletedCount: response.deletedCount});
      } else {
        console.log("Failed to delete...");
        res.status(400).json({deletedCount: response.deletedCount})
      }
    });

});
//Uses upsert to create default userSettings, assigning userEmail.
//Recieves upsertID, finds newly inserted document, returns it to client.
async function authenticateUser(userEmail, userId){
  // JWT_ky
  let pv_key = "0A6aKFksbmPgDlIKiUGcMm82eycRgTivqkZx4zjDJn2CWm9LF5Kq5wnKltq4Uk3Zlpt9UJxbf";
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

module.exports = app;
