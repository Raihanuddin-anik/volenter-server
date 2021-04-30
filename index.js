var express = require('express');
var bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
var cors = require('cors');




var admin = require("firebase-admin");

var serviceAccount = require("./volenter-netword-firebase-adminsdk-68a6o-e472f049ca.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://volenter-data:volenter431760@cluster0.ostva.mongodb.net/volenter-network?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

client.connect(err => {
  const collection = client.db("volenter-network").collection("volenter-list");
  const VNcollection = client.db("volenter-network").collection("volenterData");

  app.post('/', (req, res) => {
    const data = req.body;
    collection.insertOne(data)
      .then(result => {
        res.send('/')
      })
  })


  app.get("/products", (req, res) => {
    collection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  app.post("/addVolenter", (req, res) => {
    const product = req.body;
    console.log(product)
    VNcollection.insertOne(product)
      .then(result => {
        console.log('data added successfully');
        res.send("volenter added")
      })
  }) 

 
  app.get('/volenters', (req, res) => {

    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];

      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const quearyEmail = req.query.Email;

          if (tokenEmail == quearyEmail) {
            VNcollection.find({ Email: req.query.Email })
              .toArray((err, document) => {
                res.status(200).send(document)
              })
             
          }

          else {
            res.status(401).send('un-authoraised access')
          }
        })
        .catch(function (error) {
          res.status(401).send('un-authoraised access')
        })
    }
    else {
      res.status(401).send('un-authoraised access')
    }
    console.log("show datas")

  })


  app.delete('/delete/:id', (req, res) => {
    VNcollection.deleteOne({_id: ObjectId(req.params.id) })

      .then(result => {
        res.send(result.deletedCount > 0)
        console.log("result")
      })
  })


});
 









app.listen(4000, console.log("helloooo"))