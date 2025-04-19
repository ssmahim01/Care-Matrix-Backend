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
  const { search = "", sort = "" } = req.query;

  const filter = {
    requestedRole: "Doctor",
  };

  if (search) {
    filter.userEmail = { $regex: search, $options: "i" };
  }

  if (sort) {
    filter.department = sort;
  }

  try {
    const findAll = await requestCollection.find(filter);
    const result = await findAll.toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).send({ message: "Error fetching requests", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const findAll = await requestCollection.find({});
    const result = await findAll.toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).send({ message: "Error fetching requests", error });
  }
});

router.get("/search", async (req, res)=> {
  const search = req.query.name
  try {
    if (!search) {
      const allUsers = await requestCollection.find().toArray();
      return res.send(allUsers);
    }

    const result = await requestCollection
      .find({
        userName: { $regex: search, $options: "i" },
      })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send({ message: "Failed to search users.", error });
  }
})

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

// Get users by search params by their name
router.get("/search-users", async (req, res) => {
  const search = req.query.name?.trim();
  if (!search) {
    return res.status(400).send({ message: "Missing 'name' query parameter." });
  }
  if (!search) {
    // Return all users if no search term is provided
    const allUsers = await requestCollection.find().toArray();
    return res.send(allUsers);
  }
  try {
    const result = await requestCollection
      .find({
        userName: { $regex: search, $options: "i" },
      })
      .project({
        _id: 1,
        userName: 1,
        userEmail: 1,
        requestedRole: 1,
        userPhoto: 1,
        contactNumber: 1,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send({ message: "Failed to search users.", error });
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

// Update Note
router.patch("/update-note/:id", async (req, res) => {
  const id = req.params.id;
  const { noteOfAdministrator } = req.body;

  // Validate the Id
  if (!id) {
    return res.status(400).send({ message: "Note ID is required" });
  }

  // Validate the note
  if (!noteOfAdministrator || typeof noteOfAdministrator !== "string") {
    return res.status(400).send({ message: "Note content is required" })
  }

  const query = { _id: new ObjectId(id) }
  const updateNote = {
    $set: {
      adminNotes: noteOfAdministrator
    }
  }
  const result = await requestCollection.updateOne(query, updateNote);
  res.status(200).send({ message: "Note has been updated", result });
});

// Reject Status
router.patch("/reject-status/:id", async (req, res) => {
  const id = req.params.id;

  // Validate the Id
  if (!id) {
    return res.status(400).send({ message: "User ID is required" });
  }

  const query = { _id: new ObjectId(id) }
  const updateStatus = {
    $set: { status: "Reject" }
  }
  const result = await requestCollection.updateOne(query, updateStatus);
  res.status(200).send({ message: "Rejected the user", result });
});

// Delete user
router.delete("/delete-user/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  try {
    const user = await requestCollection.findOne(query);
    if (!user) {
      return res.status(404).send({ message: `User not found.` });
    }
    const result = await requestCollection.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(500).send({ message: "Failed to delete user." });
    }
    res.send({
      message: `User: '${user.email}' deleted successfully!`,
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send({
      error: "Failed to delete user.",
      details: err.message,
    });
  }
});

// Assign user
router.patch("/assign-status/:id", async (req, res) => {
  const id = req.params.id;

  // Validate the Id
  if (!id) {
    return res.status(400).send({ message: "User ID is required" });
  }

  const query = { _id: new ObjectId(id) }
  const assignStatus = {
    $set: { status: "Assign" }
  }
  const result = await requestCollection.updateOne(query, assignStatus);
  res.status(200).send({ message: "Assigned the user", result });
});

// Update staff
router.put("/update-profile/:email", async (req, res) => {
  const { email } = req.params;
  const { data, profileImage } = req.body;
  const result = await requestCollection.updateOne(
    { userEmail: email },
    { $set: { ...data, userPhoto: profileImage } }
  );
  res.send({ success: true, message: "Staff updated" });
});

export default router;