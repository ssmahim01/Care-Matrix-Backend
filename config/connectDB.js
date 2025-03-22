import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();

const uri = process.env.DB_URI;
const client = new MongoClient(uri);

let collections = {};

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("care_matrix_DB");

    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    collections = {
      users: db.collection("users"),
      banners: db.collection("banners"),
      appointments: db.collection("appointments"),
      doctors: db.collection("doctors")
    };

    return collections;
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

export { connectDB, collections };
