const express = require('express');
const { MongoClient } = require('mongodb');

let db;

const app = express();

// Setting ejs template engine and its views path in express app
app.set("view engine", "ejs")
app.set("views", "./views")

// Setting static folder
app.use(express.static("public"))

app.get('/', async (req, res) => {
  const allAnimals = await db.collection("animals").find().toArray();
  console.log(allAnimals);
  res.send("Home page");
})

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


async function init() {
  // Establish DB connection before server starts listening to requests
  const client = new MongoClient('mongodb://localhost:27017/mern-app?&authSource=admin');
  await client.connect();
  db = client.db();

  // Start express server
  app.listen(8000)
}
init();


