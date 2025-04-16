
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
        console.log("Contact added:", contact);
        console.log("Result:", result);
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


// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("tel");
}); // Api endpoint -> /emergency


export default router;