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
  try {
    const user = req.body;
    const password = user?.password;

    // Check if user email already exists
    const query = { email: user.email };
    const isExist = await usersCollection.findOne(query);

    if (isExist) {
      return res.status(400).send({
        message: "A user with this email already exists.",
        user: isExist,
      });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    // Post user in firebase
    let firebaseResult;
    try {
      firebaseResult = await admin.auth().createUser({
        email: user.email,
        password: password,
        displayName: user.name,
        photoURL: user.photo,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ message: `Firebase Error: ${error.message}` });
    }

    // Get user info from firebase
    const userInfo = {
      role: user?.role,
      email: user?.email,
      name: user?.name,
      password: hashedPassword,
      photo: user?.photo,
      phoneNumber: user?.phoneNumber,
      uid: firebaseResult?.uid,
      createdAt: new Date(firebaseResult?.metadata?.creationTime).toISOString(),
      lastLoginAt: new Date(
        firebaseResult?.metadata?.lastSignInTime
      ).toISOString(),
      createdBy: "assigned",
    };

    // Post user in mongoDB
    const postUserResult = await usersCollection.insertOne(userInfo);

    res.send({
      firebase: firebaseResult,
      mongoDB: postUserResult,
      message: "User Created Successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    let query = {};
    const role = req.query.role;
    const sort = req.query.sort;
    const search = req.query.search;

    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: "i" };

    let sortOption = { createdAt: -1 };

    if (sort) {
      const [field, order] = sort.split("-");
      sortOption = {
        [field]: order === "asc" ? 1 : -1,
      };
    }

    const result = await usersCollection
      .find({
        createdBy: "assigned",
        ...query,
      })
      .sort(sortOption)
      .project({
        _id: 1,
        role: 1,
        email: 1,
        name: 1,
        photo: 1,
        phoneNumber: 1,
        uid: 1,
        createdAt: 1,
        lastLoginAt: 1,
      })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
