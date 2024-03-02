const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const sanitizeHTML = require("sanitize-html")
const fse = require('fs-extra');
const sharp = require('sharp');
const path = require('path');
const React = require("react")
const ReactDOMServer = require("react-dom/server")
const AnimalCard = require("./src/components/AnimalCard").default
require('dotenv').config();

let db;
const SERVER_PORT = process.env.SERVER_PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

// When the app launches, make sure the "public/uploaded-photos" folder exists
fse.ensureDirSync(path.join("public", "uploaded-photos"));

const app = express();
const upload = multer()

// Setting ejs template engine and its views path in express app
app.set("view engine", "ejs")
app.set("views", "./views")

// Setting static folder for React main.js
app.use(express.static("public"))

// Middlewares

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

function verifyPassword(req, res, next) {
  res.set("WWW-Authenticate", "Basic realm='Our MERN App'")
  if (req.headers.authorization == "Basic YWRtaW46YWRtaW4=") {
    next()
  } else {
    console.log(req.headers.authorization)
    res.status(401).send("Try again")
  }
}

app.get("/", async (req, res) => {
  const allAnimals = await db.collection("animals").find().toArray()
  const generatedHTML = ReactDOMServer.renderToString(
    <div className="container">
      {!allAnimals.length && <p>There are no animals yet, the admin needs to add a few.</p>}
      <div className="animal-grid mb-3">
        {allAnimals.map(animal => (
          <AnimalCard key={animal._id} name={animal.name} species={animal.species} photo={animal.photo} id={animal._id} readOnly={true} />
        ))}
      </div>
      <p>
        <a href="/admin">Login / manage the animal listings.</a>
      </p>
    </div>
  )
  res.render("home", { generatedHTML })
})

app.use(verifyPassword);

app.get('/test', (req, res) => {
  res.send("Welcome to the TEST page");
})

// Serving HTML content
app.get('/html', (req, res) => {
  res.send(`<h1>Serving HTML Page</h1>`);
})

// Serving with template engine (ejs)
app.get('/home', async (req, res) => {
  const allAnimals = await db.collection("animals").find().toArray();
  res.render("home", { allAnimals });
})

app.get('/admin', (req, res) => {
  res.render("admin");
})

// === Backend APIs START === //

app.get('/api/animals', async (req, res) => {
  const allAnimals = await db.collection("animals").find().toArray();
  res.json(allAnimals);
})

app.post('/api/create-animal', upload.single("photo"), ourCleanup, async (req, res) => {
  if (req.file) {
    const fileName = `${Date.now()}.jpg`;
    await sharp(req.file.buffer).resize(844, 456).jpeg({quality: 60}).toFile(path.join("public", "uploaded-photos", fileName));
    req.cleanData.photo = fileName;
  }
  console.log("Request body: ", req.body);
  const result = await db.collection("animals").insertOne(req.cleanData);
  const newAnimal = await db.collection("animals").findOne({ _id: new ObjectId(result.insertedId) })
  res.send(newAnimal);
})

app.delete("/api/animal/:id", async (req, res) => {
  if (typeof(req.params.id) != "string") req.params.id = "";
  const doc = await db.collection("animals").findOne({_id: new ObjectId(req.params.id)});
  db.collection("animals").deleteOne({_id: new ObjectId(req.params.id)})
  if (doc.photo) {
    fse.remove(path.join("public", "uploaded-photos", doc.photo));
  }
  res.send("success");
})

app.post("/api/update-animal", upload.single("photo"), ourCleanup, async (req, res) => {
  if (req.file) {
    // if they are uploading a new photo
    const photofilename = `${Date.now()}.jpg`
    await sharp(req.file.buffer).resize(844, 456).jpeg({ quality: 60 }).toFile(path.join("public", "uploaded-photos", photofilename))
    req.cleanData.photo = photofilename
    const info = await db.collection("animals").findOneAndUpdate({ _id: new ObjectId(req.body._id) }, { $set: req.cleanData })
    if (info.photo) {
      fse.remove(path.join("public", "uploaded-photos", info.photo))
    }
    res.send(photofilename)
  } else {
    // if they are not uploading a new photo
    db.collection("animals").findOneAndUpdate({ _id: new ObjectId(req.body._id) }, { $set: req.cleanData })
    res.send(false)
  }
})

// === Backend APIs END === //


function ourCleanup(req, res, next) {
  if (typeof req.body.name != "string") req.body.name = ""
  if (typeof req.body.species != "string") req.body.species = ""
  if (typeof req.body._id != "string") req.body._id = ""

  req.cleanData = {
    name: sanitizeHTML(req.body.name.trim(), { allowedTags: [], allowedAttributes: {} }),
    species: sanitizeHTML(req.body.species.trim(), { allowedTags: [], allowedAttributes: {} })
  }

  next()
}


async function init() {
  
  // Establish DB connection before server starts listening to requests
  console.log("MongoDb_URI", MONGODB_URI)
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db();
  
  // Start express server
  app.listen(SERVER_PORT)

}
init();
