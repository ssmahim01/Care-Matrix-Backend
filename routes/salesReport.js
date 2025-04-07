import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// Initialize purchaseCollection
let purchaseCollection;
async function initCollection() {
  try {
    const collections = await connectDB();
    purchaseCollection = collections.purchase;
  } catch (error) {
    console.error("Failed to initialize purchase collection:", error);
  }
}
await initCollection();

router.get("/", async (req, res) => {
  res.send("Sales-Reports are getting ready.....");
});

export default router;
