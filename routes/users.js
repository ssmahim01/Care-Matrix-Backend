

import express from "express";
import { collections } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();


router.post("/", async (req, res) => {
  const user = req.body;
  const usersCollection = await collections.users;
  
  const query = { email: user.email };
  const isExist = await usersCollection.findOne(query);
  if (isExist) {
    return res.send(isExist);
  }
  
  const result = await usersCollection.insertOne({
    role: "user",
    ...user,
    createdAt: new Date(),
  });
  res.send({
    data: result,
    message: "User Posted In DB Successfully",
  });
}); 


router.get("/role/:email", async (req, res) => {
  const email = req.params.email;
  const usersCollection = await collections.users;
  const result = await usersCollection.findOne({ email });
  res.send({ role: result?.role });
}); 


router.put("/update-profile/:email", async (req, res) => {
  const email = req.params.email;
  const usersCollection = await collections.users;
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
}); 


router.get("/", async (req, res) => {
  const usersCollection = await collections.users;
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
}); 


router.delete("/delete-user/:email", async (req, res) => {
  const email = req.params.email;
  res.send({
    message: `User: '${email}' Deleted Successfully!`,
  });
}); 

export default router;
