// pharmacist-stats related CRUD

import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// Initialize collections
let medicinesCollection;
async function initMedicinesCollection() {
  try {
    const collections = await connectDB();
    medicinesCollection = collections.medicines;
  } catch (error) {
    console.error("Failed to initialize medicines collection:", error);
  }
}
initMedicinesCollection();

let cartsCollection;
async function initCartsCollection() {
  try {
    const collection = await connectDB();
    cartsCollection = collection.carts;
  } catch (error) {
    console.error("Failed to initialize carts collection:", error);
  }
}
await initCartsCollection();

router.get("/", (req, res) => {
  res.send("Hello from pharmacist stats");
});

export default router;
