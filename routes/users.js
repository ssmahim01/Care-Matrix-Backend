// users related CRUD
import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
const router = express.Router();
const saltRounds = 10;
import jwt from "jsonwebtoken";

// Hashing password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// Initialize usersCollection
let usersCollection;
async function initCollection() {
  const collections = await connectDB();
  usersCollection = collections.users;
}
await initCollection();

// Post new user in db --->
router.post("/", async (req, res) => {
  const user = req.body;
  const password = user?.password;

  // If new user, handle password for non-social sign-ins
  let hashedPassword = null;
  if (password) {
    hashedPassword = await hashPassword(password);
  }
  // check if user is already exists--->
  const query = { email: user.email };
  const isExist = await usersCollection.findOne(query);
  if (isExist) {
    return res.send(isExist);
  }
  // if new user save data in db --->
  const result = await usersCollection.insertOne({
    role: "patient",
    ...user,
    ...(hashedPassword && { password: hashedPassword }),
  });
  res.send({
    data: result,
    message: "User Posted In DB Successfully",
  });
}); // Api endpoint -> /users

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const storedUserHash = user.password;
    if (!password || !storedUserHash) {
      return res.status(400).send({ message: "Password or hash missing!" });
    }

    const lockUntil = user.lockUntil || null;
    let failedAttempts = user.failedAttempts || 0;

    // Check if the account is locked
    if (lockUntil && lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).send({
        message: `Too many failed attempts. Try again in ${minutesLeft} minutes.`,
        lockUntil,
      });
    }

    const isMatch = await bcrypt.compare(password, storedUserHash);
    if (!isMatch) {
      failedAttempts += 1;
      const updateData = { failedAttempts };

      // Lock the account after 4 failed attempts
      if (failedAttempts >= 4) {
        updateData.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await usersCollection.updateOne({ email }, { $set: updateData });
      return res.status(401).send({
        message: `Incorrect password. Attempts left: ${4 - failedAttempts}`,
        failedAttempts,
      });
    }

    // Reset failed attempts on successful login
    await usersCollection.updateOne(
      { email },
      { $set: { failedAttempts: 0, lockUntil: null } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).send({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error during login" });
  }
});

// Get user role --->
router.get("/role/:email", async (req, res) => {
  const email = req.params.email;
  const result = await usersCollection.findOne({ email });
  res.send({ role: result?.role });
}); // Api endpoint -> /users/role/:email

// Get user phoneNumber --->
router.get("/phone/:uid", async (req, res) => {
  const uid = req.params.uid;
  const result = await usersCollection.findOne({ uid });
  res.send({ phoneNumber: result?.phoneNumber });
}); // Api endpoint -> /users/phone/:uid

// Retrieve lockUntil and failedAttempts data from DB
router.get("/lock-profile/:email", async (req, res) => {
  const email = req.params.email;
  const result = await usersCollection.findOne({ email });
  res.send({
    lockUntil: result?.lockUntil,
    failedAttempts: result?.failedAttempts,
  });
}); // Api endpoint -> /users/lock-profile/:email

// Update user lastLoginAt --->
router.patch("/last-login-at/:email", async (req, res) => {
  const email = req.params.email;
  const { lastLoginAt } = req.body;
  const filter = { email };
  const updatedUserInfo = {
    $set: {
      lastLoginAt: lastLoginAt,
    },
  };
  const result = await usersCollection.updateOne(filter, updatedUserInfo);
  res.send({ data: result, message: "lastLoginAt Time updated successfully" });
}); // Api endpoint -> /users/update-profile/:email

// Update user profile --->
router.patch("/update-name/:email", async (req, res) => {
  const email = req.params.email;
  const { name } = req.body;
  const filter = { email };
  const updatedUserInfo = {
    $set: {
      name: name,
    },
  };
  const result = await usersCollection.updateOne(filter, updatedUserInfo);
  res.send({ data: result, message: "Username updated successfully" });
}); // Api endpoint -> /users/update-profile/:email

// ADMIN ONLY -> Get all users --->
router.get("/", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(
    result.map((item) => ({
      _id: item?._id,
      role: item?.role,
      name: item?.name,
      email: item?.email,
      photo: item?.photo,
      phoneNumber: item?.phoneNumber,
      createdAt: item?.createdAt,
      lastLoginAt: item?.lastLoginAt,
    }))
  );
}); // Api endpoint -> /users

// Delete user from db & firebase --->
router.delete("/delete-user/:email", async (req, res) => {
  const email = req.params.email;
  res.send({
    message: `User: '${email}' Deleted Successfully!`,
  });
}); // Api endpoint -> /users/delete-user/:email

export default router;
