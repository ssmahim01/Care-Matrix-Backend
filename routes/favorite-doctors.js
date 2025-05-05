import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

let favoriteDoctorsCollection;
async function initCollection() {
  try {
    const collection = await connectDB();
    favoriteDoctorsCollection = collection.favorite_doctors;
  } catch (error) {
    console.error("Failed to initialize favorite_doctors collection:", error);
  }
}
await initCollection();

let doctorsCollection;
async function initDoctorCollection() {
  try {
    const collection = await connectDB();
    doctorsCollection = collection.doctors;
  } catch (error) {
    console.error("Failed to initialize doctors collection:", error);
  }
}
await initDoctorCollection();

// Get favorite doctors
router.get("/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const result = await favoriteDoctorsCollection.find(query).toArray();
  res.send(result);
});

// Post favorite doctor
router.post("/", async (req, res) => {
  const info = req.body;
  const email = info?.email;
  const doctorId = info?.doctorInfo?._id;

  // Check if doctor is already in favorite list
  const isExist = await favoriteDoctorsCollection.findOne({
    email: email,
    "doctorInfo._id": doctorId,
  });

  if (isExist) {
    return res.status(409).send({ message: "Doctor already in favorites" });
  }

  // Update doctor vote
  const filter = { _id: new ObjectId(doctorId) };
  const updatedVote = {
    $inc: {
      vote: 1,
    },
  };

  await doctorsCollection.updateOne(filter, updatedVote);

  const result = await favoriteDoctorsCollection.insertOne(info);
  res.send(result);
});

// Delete favorite doctor
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await favoriteDoctorsCollection.deleteOne(query);
  res.send(result);
});

export default router;
