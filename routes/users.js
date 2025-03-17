// users related CRUD

import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// Get user collection for connectDB
let usersCollection;
async function initCollection() {
  const collections = await connectDB();
  usersCollection = collections.users;
}
await initCollection();

// Post new user in db --->
router.post("/", async (req, res) => {
  const user = req.body;
  // check if user is already exists--->
  const query = { email: user.email };
  const isExist = await usersCollection.findOne(query);
  if (isExist) {
    return res.send(isExist);
  }
  // if new user save data in db --->
  const result = await usersCollection.insertOne({
    role: "user",
    ...user,
    createdAt: new Date(),
  });
  res.send({
    data: result,
    message: "User Posted In DB Successfully",
  });
}); // Api endpoint -> /users

// Get user role --->
router.get("/role/:email", async (req, res) => {
  const email = req.params.email;
  const result = await usersCollection.findOne({ email });
  res.send({ role: result?.role });
}); // Api endpoint -> /users/role/:email

// Update user profile --->
router.put("/update-profile/:email", async (req, res) => {
  const email = req.params.email;
  const userInfo = req.body;
  const filter = { email };
  const updatedUserInfo = {
    $set: {
      name: userInfo?.name,
      photo: userInfo?.photo,
    },
  };
  const result = await usersCollection.updateOne(filter, updatedUserInfo);
  res.send({ data: result, message: "User profile updated successfully" });
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
      createdAt: item?.createdAt,
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
