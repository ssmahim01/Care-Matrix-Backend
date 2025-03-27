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
    console.error("Failed to initialize medicines collection:", error);
  }
}
await initCollection();

router.post("/", async (req, res) => {
  try {
    const order = req.body;
    const result = await purchaseCollection.insertOne(order);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await purchaseCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
