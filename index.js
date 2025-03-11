import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Call the express inside of app
const app = express();
// Connect to dotenv
const env = dotenv.config();
// Assigned port
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(`A request from ${req.hostname} || ${req.method} - ${req.url} at ${new Date().toLocaleTimeString()}`);
    next();
})

// MongoDB connection
const uri = process.env.DB_URI

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async() => {
  try {
    // Connect to the MongoClient
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to the MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.error);

// Get root path
app.get("/", (req, res) => {
    console.log("The server of Care Matrix is running now...");
})

// Listen the port
app.listen(port, () => {
    console.log(`Care Matrix is running at port: ${port}`);
})