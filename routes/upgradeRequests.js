import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

let requestCollection;
// Initialize Database Connection and Collections
async function mongoDBCollection() {
  try {
    await connectDB();
    requestCollection = collections.roleUpgradeRequests;
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Ensure the database is initialized before handling routes
mongoDBCollection();

// Get all users request
router.get("/doctors", async (req, res) => {
  try {
    const findAll = await requestCollection.find({requestedRole: "Doctor"});
    const result = await findAll.toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).send({ message: "Error fetching requests", error });
  }
});

// Insert the request data
router.post("/", async (req, res) => {
  const requestData = req.body;
  if (!requestData?.userName || !requestData?.userEmail || !requestData?.contactNumber || !requestData?.emergencyContact || !requestData?.requestedRole) {
    return res.status(400).send({ message: "Missing required fields: user name, user email, contact number, emergency contact and role" })
  }

  const insertResult = await requestCollection.insertOne(requestData);
  res.status(201).send({ message: "Successfully sent the request", insertResult })
});

// Get requests from users collection
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { search } = req.query;

  // Validate userId
  if (!userId) {
    return res.status(400).send({ message: "User ID is required" });
  }

  // Start with userId filter
  let query = { userId: userId };

  // Add search filter if provided
  if (search) {
    query = {
      ...query,
      $or: [
        { requestedRole: { $regex: search, $options: "i" } },
        { shift: { $regex: search, $options: "i" } },
      ]
    }
  }

  try {
    const findResult = await requestCollection.find(query).toArray();
    res.send({ data: findResult, count: findResult.length });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).send({ message: "Error fetching requests", error });
  }
});

// Delete Request
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  // Validate the Id
  if (!id) {
    return res.status(400).send({ message: "Request ID is required" });
  }

  const query = { _id: new ObjectId(id) }
  const result = await requestCollection.deleteOne(query);
  res.status(200).send({ message: "Request has been canceled", result });
});

// Delete Doctor
router.delete("/delete-doctor/:id", async (req, res) => {
  const id = req.params.id;

  // Validate the Id
  if (!id) {
    return res.status(400).send({ message: "ID is required" });
  }

  const query = { _id: new ObjectId(id) }
  const result = await requestCollection.deleteOne(query);
  res.status(200).send({ message: "Doctor has been deleted", result });
});

// Update status
router.patch("/status/:id", async (req, res) => {
  const id = req.params.id;

  // Validate the Id
  if (!id) {
    return res.status(400).send({ message: "Request ID is required" });
  }

  const query = { _id: new ObjectId(id) }
  const updateStatus = {
    $set: {
      status: "Cancel"
    }
  }
  const updateResult = await requestCollection.updateOne(query, updateStatus);
  res.status(200).send({ message: "Status has been updated", updateResult });
});

export default router;