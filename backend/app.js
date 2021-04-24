
const express = require('express'); //import express
const cors = require('cors');

const app = express(); //important: app is just a chain of middleware. Funnel of functions that do things to the request. read values. manipulate...send responses etc
const MongoClient = require("mongodb").MongoClient;
var ObjectID = require('mongodb').ObjectID;

const EventEmitter = require('events');

//const connectionString = "mongodb+srv://Dan:x6RTQn5bD79QLjkJ@cluster0.uljb3.gcp.mongodb.net/MBEdge?retryWrites=true&w=majority";
const connectionString = "mongodb+srv://Randy:thaiMyShoe456@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";
const client = new MongoClient(connectionString, {useUnifiedTopology: true, useNewUrlParser: true});

async function connectDB(client){

  try {
    await client.connect( {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})
    .then(() =>  { console.log('Connected to database!')})
    .catch(() => { console.log('Connection failed!');});
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
const streamEmitter = new EventEmitter();


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

    //add route to handle requests for a specific path


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

//development purposes
async function updateMatches(client){
  const collection = client.db("MBEdge").collection("matches");
  const changeStream = collection.watch();
  changeStream.on('change', (next) => {
    console.log(next.fullDocument);
    //res.write( next + "\n\n" );
  });
}

app.get('/api/updates',  function(req, res) {
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

//input path and middleware for executing MongoStream.

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

app.get('/api/user', async(req,res) => {
  try{
    const cursor = await client.db("JuicyClients").collection("juicy_users").find({});
    const matchesList = await cursor.toArray();
    let body = matchesList;
    if(body != undefined) {res.status(200).json({body})}
  } catch (e) {
    console.log(e);
  }
});

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



// async(req, res) => {
//   const sabEntry = req.body;
//   console.log(sabEntry);
//   try{
//     const cursor = await client.db("JuicyClients").collection("juicy_users_sab").insertOne(sabEntry);
//     const sabEntry = await cursor.toArray();
//     let body = sabEntry;
//     res.status(200).json({body})
//     //pass information  that you want to insert into JuicyClient.juicy_user_data
//   }catch (e) {
//     console.log(e);
//   }
// })

// //need to export this in the module.exports object.
    module.exports = app; //sends the constant app and all its middleware. import it to server.js



    // const wss = new WebSocket.Server({ server: server });

    // const connectionString = "mongodb+srv://Dan:x6RTQn5bD79QLjkJ@cluster0.uljb3.gcp.mongodb.net/MBEdge?retryWrites=true&w=majority";
    // //const connectionString = "mongodb+srv://Randy:juicyBets2020@clusterme.lfzcj.mongodb.net/MBEdge?retryWrites=true&w=majority";


    // //CHANGED poolSize to w
    // wss.on('connection', function connection(ws, client) {

    //    console.log("A new Client Connected");
    //     client.connect() // TOD: this connect() is being called a second time, inefficient in code. need to re-structure this code with app.js file to call one connect.
    //     .then( ()  => {
    //         console.log('ChangeStream Init');
    //         const changeStream = client.db("MBEdge").collection("matches").watch();
    //         changeStream.on("change", next => {
    //           const doc = JSON.stringify(next.fullDocument);
    //           ws.send(doc);
    //         })
    //       }).catch( () => { console.log('Stream failed!');
    //     });

    //    // ws.send("Server.js: Weclome New Client!"); //this sends to websockets

    //     ws.on('message', function incoming(message) {
    //         console.log('received: %s', message);
    //         ws.send('In server.js incoming(message) its, ' + message);
    //     });

    //     process.on('uncaughtException', function (err) {
    //       console.error((new Dat) + ' uncaughtException:' , err.message)
    //       console.error(err.stack)
    //     })
    // });
