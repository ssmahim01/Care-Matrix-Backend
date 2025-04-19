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

// serviceAccount
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
};

// Intialize the firebase-admin project/account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

router.post("/assign-user", async (req, res) => {
  // Post user in firebase
  // Get user info from firebase
  // Post user in mongoDB
});

export default router;
