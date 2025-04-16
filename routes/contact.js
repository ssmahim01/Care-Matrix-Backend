import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
const router = express.Router();

let contactCollection;
async function initContactCollection() {
  try {
    await connectDB();
    contactCollection = collections.contacts;
  } catch (error) {
    console.error("Error initializing contacts collection:", error);
  }
}
initContactCollection();

router.post("/", async (req, res) => {

});

export default router;
