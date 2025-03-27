import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
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

// Insert the request data
router.post("/", async (req, res) => {
    const requestData = req.body;
    if (!requestData?.userName || !requestData?.userEmail || !requestData?.contactNumber || !requestData?.emergencyContact || !requestData?.requestedRole) {
        return res.status(400).send({ message: "Missing required fields: user name, user email, contact number, emergency contact and role" })
    }

    const insertResult = await requestCollection.insertOne(requestData);
    res.status(201).send({ message: "Successfully sent the request", insertResult })
});

router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;
  
    // Validate userId
    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }
  
    const query = { userId };
  
    try {
      const findResult = await requestCollection.find(query).toArray();
      res.send({ data: findResult, count: findResult.length });
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).send({ message: "Error fetching requests", error });
    }
  });

export default router;