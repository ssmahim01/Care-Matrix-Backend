import express from "express";
import { connectDB } from "../config/connectDB.js";
const router = express.Router();

let paymentsCollection;
async function initCollection() {
  try {
    const dbCollections = await connectDB();
    if (!dbCollections?.payments) {
      throw new Error("Payments collection not initialized.");
    }
    paymentsCollection = dbCollections.payments;
  } catch (error) {
    console.error("Failed to initialize payments collection:", error.message);
  }
}
initCollection();

router.get("/", async (req, res) => {

});

export default router;
