
const express = require('express');
const app = express();
const cors = require('cors');
const checkAuth = require("./middleware/check-auth");
const jwt = require('jsonwebtoken');
const path = require('path');
const envFilePath = path.resolve(__dirname, './.env');
const env = require("dotenv").config({ path: envFilePath });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27'
});
// Stripe webhook endpoint Secret from CLI

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
//                              API TO BACKEND                                        //
////////////////////////////////////////////////////////////////////////////////////////
//Retrieves User Settings or generates a default one.

app.get('/api/test', async (req,res)=>{
  res.status(200).json({message:"Test O.K"})
});

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
//               STRIPE PAYMENT PROCESSING API CALLS                                  //
////////////////////////////////////////////////////////////////////////////////////////

// Copy the .env.example in the root into a .env file in this folder
if (env.error) {
  throw new Error(`Unable to load the .env file from ${envFilePath}. Please copy .env.example to ${envFilePath}`);
}


app.use(express.static(process.env.STATIC_DIR));

// Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session", async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

app.post("/create-checkout-session", async (req, res) => {
  const domainURL = process.env.DOMAIN;
  const  priceId  = req.body.priceId;
  const customerEmail = req.body.email;
  console.log(req.body);
  // Create new Checkout Session for the order
  // Other optional params include:
  // [billing_address_collection] - to display billing address details on the page
  // [customer] - if you have an existing Stripe Customer ID
  // [customer_email] - lets you prefill the email input in the form
  // For full details see https://stripe.com/docs/api/checkout/sessions/create
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      customer_email: customerEmail,
      success_url: `${domainURL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainURL}`,
    });

    console.log("~~~~~~~~~~Session:~~~~~~~~~~~");
    console.log(session);

    res.send({
      sessionId: session.id,
    });
  } catch (e) {
    res.status(400);
    return res.send({
      error: {
        message: e.message,
      }
    });
  }
});

app.get("/setup", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    basicPrice: process.env.BASIC_PRICE_ID,
    proPrice: process.env.PRO_PRICE_ID,
  });
});

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});


app.post("/subscription", async (req,res) => {
  //Need to make sure multiple emails do not exist.
  const email = req.body.email;

  let update = {
    last_signed_in : 0,
  }
  await client.db("JuicyClients").collection("juicy_users_subcription")
  .findOne({'cust_email' : email})
    .then( userDoc => {
      if(userDoc == null){
        console.log("No subscription associated with " + email);
        res.status(200).json({isActiveSub:false, isNewUser: true, userAcceptedTerms: false});
      } else if( userDoc != null && userDoc.subscription_status == 'paid') {
        console.log(email + " subscription is valid!");
        res.status(200).json({isActiveSub:true, isNewUser: false, userAcceptedTerms: userDoc.accepted_terms});
      } else if (userDoc != null && userDoc.subscription_status == 'unpaid') {
        res.status(400).json({isActiveSub:false, isNewUser: false, userAcceptedTerms: userDoc.accepted_terms});
      }
    })
    .catch(err => console.error(`Failed to find documents: ${err}`));
});
// Webhook handler for asynchronous events.
app.post('/webhook', express.raw({type: 'application/json'}),  (request, response) => {
  const payload = request.body;
  const sig = request.headers['stripe-signature'];
  const webhookSecret = 'whsec_qwedhfV13bJ5peI9pLCMrqaLa4ZBTpM0';
  // console.log("///////////////////////////////////////////////");
  // console.log(payload);
  // console.log("///////////////////////////////////////////////");
  let event;
  //Testing: event= payload confirm that constructEvent works for LIVE mode.
  event = payload;
  // try {
  //   event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  //   console.log("~~~~~~SUCCESS: " + event.type);
  // } catch (err) {
  //   console.log(err.message);
  //   return response.status(400).send(`Webhook Error: ${err.message}`);
  // }
  //Successfully constructed event
  console.log('✅ Success:', event.id);
  const subscription_collection = client.db("JuicyClients").collection("juicy_users_subcription");
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutCompleteEvent = event.data.object;
      console.log('////////////Completed Checkout////////////');
      console.log(checkoutCompleteEvent);
      console.log('////////////////////////////////////');
      //Provision subscription + Get Customer ID &  Write to MongoDB
      const customerID = checkoutCompleteEvent.customer;
      // assign email, status (paid/unpaid) and create a paid_on field.
      let document = {
        cust_id: customerID,
        cust_email: checkoutCompleteEvent.customer_details.email,
        subscription_id: checkoutCompleteEvent.subscription,
        subscription_status:  checkoutCompleteEvent.payment_status,
        subscription_paid_on: 0,
        last_signed_in: 0,
        accepted_terms: true,

      }
      subscription_collection.insertOne(document, function (error, response){
        console.log("New Subscriber: " + document.cust_email + " created!");
      });

      break;
      case 'invoice.paid':
        const paidInvoiceEvent = event.data.object;
        console.log('////////////Invoice Paid////////////');
        console.log(paidInvoiceEvent.status_transitions.paid_at);
        console.log('////////////////////////////////////');
        const query = { "cust_id" : paidInvoiceEvent.customer };

        const update = {
           "$set": {
             "subscription_status" : checkoutCompleteEvent.payment_status,
             "subscription_paid_on" : paidInvoiceEvent.status_transitions.paid_at
           }
         }

        const options  = { returnNewDocument: true };
        //Continue to provision Subscription as payments continue to be made.
        subscription_collection.findOneAndUpdate(query, update, options).then( updatedDocument => {
          if(updatedDocument){
            console.log("Successfully updated document");
          } else {
            console.log("Failed to update document");
          }
          return updatedDocument
        }).catch( err => console.error('Failed to find and update document: ' + err))
        //Update Status & expiration...can check user access frequency.
        break;

      case 'invoice.payment_failed':
          const invoiceFailed = event.data.object;
          console.log('////////////Invoice *FAILED*////////////');
          console.log(invoiceFailed);
          console.log('////////////////////////////////////');
          // The payment failed or the customer does not have a valid payment method.
          // The subscription becomes past_due. Notify your customer and send them to the
          // customer portal to update their payment information.
        break;

      case 'payment_intent.succeeded':
          const piSucceededEvent = event.data.object;
          console.log('////////////PI Success!////////////');
          console.log(piSucceededEvent);
          console.log('////////////////////////////////////');
          // The payment failed or the customer does not have a valid payment method.
          // The subscription becomes past_due. Notify your customer and send them to the
          // customer portal to update their payment information.
        break;
          default:
            console.log(`Unhandled event type ${event.type}`);
          }
         // Return a response to acknowledge receipt of the event
         response.status(200).json({message:"Test O.K"});
  });

  app.post('/customer-portal', async (req, res) => {
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = process.env.DOMAIN;
    const client_email = req.body.email;

    const subscription_collection = client.db("JuicyClients").collection("juicy_users_subcription");
    let cust_id;

    await subscription_collection.findOne({"cust_email" : client_email})
    .then( document => {
      console.log(document);
      cust_id = document.cust_id;
      console.log("CUSTOMER ID 1: " + cust_id);
    })

    console.log("CUSTOMER ID 2: " + cust_id);
    const portalsession = await stripe.billingPortal.sessions.create({
      customer: cust_id,
      return_url: returnUrl,
    });

    res.send({
      url: portalsession.url,
    });


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
                                  // console.log(response.upsertedId._id);
                                 resolve(client.db("JuicyClients").collection("juicy_users").findOne(filter));
                              });
                            });
}

module.exports = app;
