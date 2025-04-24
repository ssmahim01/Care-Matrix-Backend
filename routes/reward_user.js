import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

let rewardUsersCollection;
// Initialize Database Connection and Collections
async function mongoDBCollection() {
  try {
    await connectDB();
    rewardUsersCollection = collections.reward_users;
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Ensure the database is initialized before handling routes
mongoDBCollection();

router.get("/:email", async (req, res) => {
  const email = req.params.email;
  const query = { userEmail: email }
  const result = await rewardUsersCollection.find(query).toArray()
  console.log(result);
  res.send(result)
})

// Add reward user 
router.post("/", async (req, res) => {
  const reward = req.body;
  const result = await rewardUsersCollection.insertOne(reward)
  res.send(result)
  // console.log("Reward info", reward);
})


// Api endpoint -> /reward-users

export default router;
