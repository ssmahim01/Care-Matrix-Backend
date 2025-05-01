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
      roleUpgradeRequests: db.collection("roleUpgradeRequests"),
      banners: db.collection("banners"),
      beds: db.collection("beds"),
      appointments: db.collection("appointments"),
      doctors: db.collection("doctors"),
      payments: db.collection("payments"),
      medicines: db.collection("medicines"),
      bed_booking: db.collection("bed_booking"),
      carts: db.collection("carts"),
      rewards: db.collection("rewards"),
      redeemableRewards: db.collection("redeemableRewards"),
      purchase: db.collection("purchase"),
      favorite_doctors: db.collection("favorite-doctors"),
      contacts: db.collection("contacts"),
      emergency: db.collection("emergency"),
      ambulance: db.collection("ambulance"),
      triage: db.collection("triage"),
      reward_users: db.collection("reward_user"),
      prescriptions: db.collection("prescriptions"),
      chat: db.collection("chat"),
      review: db.collection("review"),
      blogs: db.collection("blogs"),
    };

    return collections;
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

export { connectDB, collections };
