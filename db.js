const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017"; // replace if using Atlas
const client = new MongoClient(url);
let db;

async function connectDB() {
  await client.connect();
  db = client.db("virtualPetDB");
  console.log("MongoDB connected!");
}

function getDB() {
  if (!db) throw new Error("Database not connected!");
  return db;
}

module.exports = { connectDB, getDB };
