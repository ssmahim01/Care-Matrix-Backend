
import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";


const router = express.Router();

// Initialize usersCollection
let emergencyCollection;
async function initCollection() {
    const collections = await connectDB();
    emergencyCollection = collections.emergency;
}
await initCollection();


router.get("/contacts", async (req, res) => {
    const results = await emergencyCollection.find().toArray();
    res.send(results)
})

// Add an ambulance in db
router.post("/add-contact", async (req, res) => {
    try {
        const contact = req.body;
        const result = await emergencyCollection.insertOne({ ...contact });
        res.status(201).send({
            message: "Contact added successfully",
            contact,
            result
        });
    } catch (error) {
        console.error("Error adding contact:", error);
        res.status(500).send({
            error: "Failed to add emergency contact. Please try again later."
        });
    }
}); // API endpoint -> /emergency/add-contact

// Delete a contact from db
router.delete("/delete-contact/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const { name } = await emergencyCollection.findOne(query) || {};

    if (!id) return res.send({ message: `No contact matched` });

    const result = await emergencyCollection.deleteOne(query);
    if (result.deletedCount === 1) {
        res.send({ message: `Successfully deleted ${name}.` });
    } else {
        res.send({ message: "No contact matched." });
    }
}) // Api endpoint -> /emergency/delete-contact/:id

router.put('/update-contact/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const contact = req.body;
        const query = { _id: new ObjectId(id) };

        const updatedDoc = {
            $set: {
                ...contact
            }
        };

        const result = await emergencyCollection.updateOne(query, updatedDoc);
        if (result.matchedCount === 0) {
            return res.status(404).send({ error: "Emergency contact not found" });
        }

        res.status(200).send({
            message: "Emergency contact updated successfully",
            result
        });
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).send({
            error: "Failed to update emergency contact. Please try again later."
        });
    }
}); // API endpoint -> /emergency/update-contact/:id

// get emergency contact by search params by their name
router.get("/search", async (req, res) => {
    const search = req.query.name?.trim();

    if (!search) {
      return res.status(400).send({ message: "Missing query parameter." });
    }
    if (!search) {
      // Return all users if no search term is provided
      const allUsers = await emergencyCollection.find().toArray();
      return res.send(allUsers);
    }
    try {
      const result = await emergencyCollection
        .find({
          name: { $regex: search, $options: "i" },
          
        })
        .project({
          _id: 1,
          name: 1,
          email: 1,
          type: 1,
          address: 1,
          phone: 1,
          available: 1,
        })
        .toArray();
  
      res.send(result);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).send({ message: "Failed to search contacts.", error });
    }
  }); // Api endpoint -> /users/search?contact={value}


// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("emergency routes starting endpoint");
}); // Api endpoint -> /emergency


export default router;