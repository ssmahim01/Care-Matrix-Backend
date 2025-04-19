import express from "express";
import { connectDB } from "../config/connectDB.js";
import admin from "firebase-admin";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();
const router = express.Router();
const saltRounds = 10;

// Hashing password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

let usersCollection;
async function initCollection() {
  try {
    const dbCollections = await connectDB();
    if (!dbCollections?.users) {
      throw new Error("users collection not initialized.");
    }
    usersCollection = dbCollections.users;
  } catch (error) {
    console.error("Failed to initialize users collection:", error.message);
  }
}
initCollection();

router.post("/assign-user", async (req, res) => {
  // Post user in firebase
  // Get user info from firebase
  // Post user in mongoDB
});

export default router;
