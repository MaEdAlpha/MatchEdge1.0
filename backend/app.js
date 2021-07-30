
const express = require('express');
const app = express();
const cors = require('cors');
const checkAuth = require("./middleware/check-auth");
const jwt = require('jsonwebtoken');
const path = require('path');
const envFilePath = path.resolve(__dirname, './.env');
const env = require("dotenv").config({ path: envFilePath });
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const paypal = require('@paypal/checkout-server-sdk');
var request  = require('request');


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
// const connectionString = "mongodb+srv://Randy:4QQJnbscvoZQXr0l@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";
// const connectionString = "mongodb+srv://ryan:MGoGo2021GU12$@juicybets.tcynp.mongodb.net/MBEdge?retryWrites=true&w=majority";
const connectionString = process.env.MONGO_CONNECT_STR;

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
//                              CONNECT USER                                          //
////////////////////////////////////////////////////////////////////////////////////////
//Retrieves User Settings or generates a default one.

// app.get('/api/test', async (req,res)=>{
//   res.status(200).json({message:"Test O.K"})
// });

app.put('/api/user/connect', async (req,res) => {
  //upsert document. If new user, return _id. If not new user, find in database.
  const filter = {"account.email": req.body.email};
  //Upon auth0 authentication, return user settings or generate default user settings + generate and send back token
  client.db("JuicyClients")
    .collection("juicy_users")
        .findOne( filter, function(error,response){
                        try{
                          error ? console.log("error: " + error) : '';
                          // console.log(response);
                          //if null, create a new user.
                              if(response == null){
                                console.log("Creating new user profile with default settings");
                                //Create new document
                                createNewUserDocument( req.body.email).then( response => {
                                  console.log(req.body.sub);
                                  authenticateUser(req.body.email, req.body.sub)
                                  .then( generatedToken => {
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
                        } catch (e) { res.status(300).json({token: "Error retrieving user details"});
                      } finally { console.log("Enter.....");}

                      });
    });
/////////////////////////////////////////////////////////////////////////////////////////
//               PAYPAL PAYMENT PROCESSING API CALLS                                  //
////////////////////////////////////////////////////////////////////////////////////////
// Creating an environment
let clientId = "AamQykAJWLnNDxCtnxpjJM3pNeWdvFR6xhiMP7QWJXUOVSJElOj4bcx7PAi92RSV4ZfLh8zS1MfIgh4N";
let clientSecret = "EFwpsvpjfVglBuPcXURyd2wsPJ4AAztjVgKpVMfhgtDdbe-uxscXxqZL7P85Re-LXnZOrv4gPFHiE0ia";
// This sample uses SandboxEnvironment. In production, use LiveEnvironment
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let elonMusky = new paypal.core.PayPalHttpClient(environment);
let token_option = new paypal.core.AccessTokenRequest(environment);
let access_token = new paypal.core.AccessToken(token_option);


// Construct a request object and set desired parameters
// Here, OrdersCreateRequest() creates a POST request to /v2/checkout/orders
// let request = new paypal.orders.OrdersCreateRequest();
// request.requestBody({
//                           "intent": "CAPTURE",
//                           "purchase_units": [
//                               {
//                                   "amount": {
//                                       "currency_code": "GBP",
//                                       "value": "100.00"
//                                   }
//                               }
//                            ]
//                     });

// // Call API with your client and get a response for your call
// let createOrder  = async function(){
//         let response = await elonMusky.execute(request);
//         console.log(`Response: ${JSON.stringify(response)}`);
//         // If call returns body in response, you can get the deserialized version from the result attribute of the response.
//        console.log(`Order: ${JSON.stringify(response.result)}`);

//        console.log(paypal);
// }
// createOrder();



app.post('/paypal-transaction', async (req,res) => {
  const orderID = req.body.orderID;
  const created = new Date(req.body.orderCreated).toUTCString();
  const nextPayment = new Date(req.body.orderCreated + (7*24*60*60*1000)).toUTCString();
  const email = req.body.email;
  const subID = req.body.subID;
  let subActivated = false;
  let request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID);
  let order;
  console.log("---> NEW SUBSCRIPTION: " + email + " Subscription: " + subID + " Created: " + created );
  try {
    order = await elonMusky.execute(request);
    console.log(order.result.payer.name);
    console.log(order.result.payer.address);
  } catch (err) {
    // 4. Handle any errors from the call
    console.error(err);
    return res.status(500);
  }

  // 5. Validate the transaction details are as expected
  if (order.result.purchase_units[0] == '220.00') {
    return res.status(400).json({error: 'Error occured, please contact support'});
  }

  // 6. Save the transaction in your database
  // await database.saveTransaction(orderID);
  let replace_document = {
    juicy_email: email,
    juicy_birth: order.result.create_time,
    subscription_id: subID,
    subscription_status:  order.result.status,
    subscription_paid_on: created,
    subscription_next_payment: nextPayment,
    subscription_email: order.result.payer.email_address,
    uniqe_tag: order.result.payer.name.given_name+"_"+order.result.payer.name.surname,
    last_login: created,
    accepted_terms: true,
  }
  /* - covers scenario where subscription is cancelled, but they end up renewing, and exist in the database.
     - also prevents duplicate emails from signing up */

  const subscription_collection = client.db("JuicyClients").collection("juicy_users_subscription");
  await subscription_collection
    .findOneAndReplace( {juicy_email: email}, replace_document, {upsert: true, returnDocument: true}, function (error, response){
      try{
        console.log("Upsert Reference: " + response.lastErrorObject?.upserted);
        console.log("---> SUBSCRIPTION UPDATED for: " + response.value.subscription_email + "  invoiced to. At: " + response.value.subscription_paid_on);
        subActivated = true;

      } catch (err) {
          if(error == null){
            console.log("---> NEW USER CREATED: " + email);
          }
      }
    });
  // 7. Return a successful response to the client
  return res.status(200).json({status: order.result.status, invoiced_to: order.result.payer.email_address, subActivated: subActivated});

});


app.post('/webhook', async (req, res) => {
  let postData = req.body
  //console.log(JSON.stringify(postData, null, 4));
  const subscription_collection = client.db("JuicyClients").collection("juicy_users_subscription");
  //https://developer.paypal.com/docs/api-basics/notifications/webhooks/event-names/#subscriptions
  if(postData.event_type == "BILLING.SUBSCRIPTION.ACTIVATED"){
    console.log("///////////////////////////////////////////////////////////////////////////////////////");
    console.log("Subscription Activated!");
    console.log(postData.resource.id);
    console.log(postData.resource.billing_info.last_payment.time);
    console.log(postData.resource.billing_info.next_billing_time);

    //updateDataBase with last_payment
    //updateDataBase with next_billing_cycle
    console.log("///////////////////////////////////////////////////////////////////////////////////////");
  }

  if(postData.event_type == "PAYMENT.SALE.COMPLETED"){
    console.log("///////////////////////////////////////////////////////////////////////////////////////");
    //Payment is made on a subscription
    console.log("Payment Completed");
    // console.log(JSON.stringify(postData.resource, null, 4));
    console.log(postData.summary + " for SubID: " + postData.resource.billing_agreement_id);
    let payPalUrl="https://api-m.sandbox.paypal.com/v1/billing/subscriptions/";
    //retrieve subscription ID and get Subscriptions information
    let subID = postData.resource.billing_agreement_id;
    const basic_token = environment.authorizationString(); //call api to get token
    let getUrl = payPalUrl+subID;
    let lastPaid;
    let nextPayment;
    var headers = {
      'Content-Type': 'application/json',
      'Authorization': basic_token
    };

    var options = {
      url: getUrl,
      headers: headers,
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
          let subObject = JSON.parse(body);
          lastPaid = subObject.billing_info.last_payment.time;
          nextPayment = subObject.billing_info.next_billing_time;
      } else {
        console.log(JSON.stringify(response, null, 4));
      }
  }

  let query = {'juicy_email' : subID }
  let update = { $set: {'subscription_status' : postData.resource.status,
                        'subscription_paid_on' : lastPaid,
                        'subscription_next_payment': nextPayment
                        }
                }

    subscription_collection.findOneAndUpdate(query, update , {upsert:false}).then( response => {
        console.log(response);
    });

          request(options, callback);
    console.log("///////////////////////////////////////////////////////////////////////////////////////");
  }

  if(postData.event_type == "BILLING.SUBSCRIPTION.CANCELLED"){
    console.log("///////////////////////////////////////////////////////////////////////////////////////");
    console.log("Subscription Cancelled!");
    // console.log(JSON.stringify(postData.resource, null, 4));
    let subscriber_email = postData.resource.subscriber.email_address;
    let subscriptionID = postData.resource.id;
    let cancellationTime = postData.resource.status_update_time;
    let subscriptionState = postData.resource.status;
    console.log(subscriber_email + " " + subscriptionState + " at " + cancellationTime + " for ID: " , subscriptionID);

    //Update Database.
    let query = { 'subscription_id' : postData.resource.id }
    let update = { $set: {'subscription_status' : postData.resource.status }}

    subscription_collection.findOneAndUpdate(query, update , {upsert:false}).then( response => {
      console.log(response);
    });
    console.log("///////////////////////////////////////////////////////////////////////////////////////");
  }

  if(postData.event_type == 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'){
    console.log("///////////////////////////////////////////////////////////////////////////////////////");
    console.log("Failed Payment on subscription");
    //suspend activity of subscription, set subscription_status: suspended. User flow? Login with non active subscription bars them access.....

    let query = { 'subscription_id' : postData.resource.id }
    let update = { $set: {'subscription_status' : 'FAILED PAYMENT' }}

    subscription_collection.findOneAndUpdate(query, update , {upsert:false}).then( response => {
      console.log(response);
    });
    //User should be able to make a payment via button in manage billing.

    //if payment fails, send a message to user saying they have to update their subscription/make a payment.
    // console.log(JSON.stringify(postData, null, 4));
    console.log(postData.resource.id + " is " + postData.resource.status + " but..." + postData.summary + " amount due is: " + postData.resource.billing_info.outstanding_balance.value + " " + postData.resource.billing_info.outstanding_balance.currency_code);
    console.log("///////////////////////////////////////////////////////////////////////////////////////");
  }
});

app.post('/cancel-subscription', async (req, res)=>{
  let subID = req.body.subID;
  let created = new Date().toUTCString();
  const basic_token = environment.authorizationString(); //call api to get token
  let cancelUrl = "https://api-m.sandbox.paypal.com/v1/billing/subscriptions/"+subID+"/cancel";
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': basic_token
  };

  var dataString = "" //insert reason?

  var options = {
    url: cancelUrl,
    method: 'POST',
    headers: headers,
    body: dataString
  };

  function callback(error, response, body) {
      if (!error && response.statusCode == 204) {
        console.log("CANCELLATION: " + subID + " requested at " + created );
          res.status(200).json({message:'Cancellation completed!'});
      } else {
          console.log("VERIFY CANCELLATION: " + subID + " error was thrown in callback");
      }
  }

  request(options, callback);

});

app.post('/billing-info', async (req,res)=>{
  let email = req.body.email

  const subscription_collection = client.db("JuicyClients").collection("juicy_users_subscription");
  await subscription_collection.findOne({'juicy_email':email}, function (error,response){
    try{
      console.log(response);
      response.subscriptionID; //where do you get subscriptionUpdates.....

      response = {
                  subscription: response.subscription_id,
                  status: response.subscription_status,
                  lastPaid: response.subscription_paid_on,
                  nextPayment: response.subscription_next_payment,
                  subscription_email: response.subscription_email
      }

      return res.status(200).json(response);

    } catch (err){
      console.log(err);
    }
  });
})

app.post("/subscription", async (req,res) => {
  //Need to make sure multiple emails do not exist.
  let email = req.body.email;
  let login = new Date(new Date(req.body.login).toUTCString())
  //update UserLogin
  let update = { $set:{'last_login' : login } }

  await client.db("JuicyClients").collection("juicy_users_subscription")
  .findOneAndUpdate({'juicy_email' : email}, update, {upsert:false})
    .then( userDoc => {
      let juicyUser = userDoc.value;

      if(userDoc.value == null){

        console.log("NO_ACCOUNT: " + email + " " + login);
        res.status(200).json({isActiveSub:false, isNewUser: true, status: 'INACTIVE', expiry: Date.now() });

      } else if( userDoc != null && isNotFailedPayment(juicyUser.subscription_status) && subscriptionStillActivated(juicyUser.subscription_next_payment) ) {

        console.log("VISIT: " + email + " exists. Subscription: " + juicyUser.subscription_status + " for " + login);
        res.status(200).json({isActiveSub:true, isNewUser: false, status: juicyUser.subscription_status, expiry: juicyUser.subscription_next_payment });

      } else if (userDoc != null && !isNotFailedPayment(juicyUser.subscription_status)) {

        console.log("VISIT: " + email + " exists! Subscription: " + juicyUser.subscription_status + " for " + login);
        res.status(200).json({isActiveSub:false, isNewUser: false, status: juicyUser.subscription_status, expiry: juicyUser.subscription_next_payment });

      } else {
        console.log("CONDITION_CATCH: " + email + " " + login);
        res.status(200).json({isActiveSub:false, isNewUser: true, status: 'INACTIVE', expiry: Date.now() });
      }
      console.log(userDoc);
     // console.log("Grant Access to " + email + "? " + isNotFailedPayment(juicyUser.subscription_status) + " " + subscriptionStillActivated(juicyUser.subscription_next_payment));
    })
    .catch( (err) =>  {
      console.error(`Failed to find documents: ${err}`)
    });

    function subscriptionStillActivated(endOfPaymentCycle){
      if(endOfPaymentCycle == null) {
        return false;
      }
       return Date.now() < Date.parse(endOfPaymentCycle);
    }

    function isNotFailedPayment(accountStatus){
      if(accountStatus == 'APPROVED' || accountStatus == 'CANCELLED')
      {
        return true;
      } else {
        return false;
      }
    }
});

/////////////////////////////////////////////////////////////////////////////////////////
//               INITIAL MATCHES AND STREAM DATA API                                  //
////////////////////////////////////////////////////////////////////////////////////////
//TODO: Authenticat UPDATES API Call. Need to pass token in here and assign to writeHead(200)
app.get(`/api/updates`, function(req, res) {
//'X-Accel-Buffering': turns off server buffering for SSE to work
//PRODUCTION CORS : 'https://www.juicy-bets.com'
//TODO can you wildcard Access-control-allow-origin?
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

    //point to matches collection and watch it.
    const collection =  client.db("MBEdge").collection("matches");
    const changeStream = collection.watch([],{fullDocument : "updateLookup"});

    let keepAliveMS = 45 * 1000;

    function keepAlive(){
        console.log("keep-alive");
        res.write("event:message\n" + "data: hearbeat\n\n");
        setTimeout(keepAlive, keepAliveMS);
      }
      //send SSE events back to user
      changeStream.on('change', (next) => {
        console.log(next.fullDocument);
        var data = JSON.stringify(next.fullDocument);
        var msg = ("event: message\n" + "data: " + data + "\n\n");
        res.write(msg);
      });
      setTimeout(keepAlive, keepAliveMS);

});

app.get('/api/matches', checkAuth, async(req, res) => {

    const cursor = await client.db("MBEdge").collection("matches").find().sort({"League": 1, "unixDateTimestamp":1});
    const matchesList = await cursor.toArray();
    let body = matchesList;
    res.status(200).json({body})
});

app.get('/api/policy', async(req,res) => {
  res.writeHead(200, {'Content-Type': 'text/html'}).json({response:'fetched!'});
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
      // console.log(cursor);
      const sabList = await cursor.toArray();
      let body = sabList;
      // console.log(body);
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

    console.log("Echo, user/settings");
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
  let pv_key = process.env.JWT_PVT_K;
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
  const update = { $set: { "account":{  "username":"JuicyUser",
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
                                  // console.log(response.upsertedId._id);
                                 resolve(client.db("JuicyClients").collection("juicy_users").findOne(filter));
                              });
                            });
}



module.exports = app;
