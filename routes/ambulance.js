
import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";


const router = express.Router();

// Initialize usersCollection
let ambulanceCollection;
async function initCollection() {
    const collections = await connectDB();
    ambulanceCollection = collections.ambulance;
}
await initCollection();


router.post("/add", async (req, res) => {
    try {
        const ambulance = req.body;
        const result = await ambulanceCollection.insertOne({ ...ambulance });
        res.status(201).send({
            message: "Ambulance added successfully",
            ambulance,
            result
        });
    } catch (error) {
        res.status(500).send({
            error: "Failed to add ambulance. Please try again later."
        });
    }
})

router.get("/all", async (req, res) => {
    const results = await ambulanceCollection.find().toArray();
    res.send(results)
})

router.delete("/delete-ambulance/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    if (!id) return res.send({ message: "Id is required" })

    const result = await ambulanceCollection.deleteOne(query)

    if (result.deletedCount === 1) {
        res.send({ message: "Successfully deleted." });
    } else {
        res.send({ message: "No id matched the query." });
    }
})

router.put("/book/:id", async (req, res) => {
    try {
        const patientDetails = req.body;
        const id = req.params.id;

        if (!patientDetails) {
            return res.status(400).json({ message: "Patient details are required" });
        }

        const query = { _id: new ObjectId(id) };
        const updatedDoc = {
            $set: {
                status: "En Route",
                patientDetails: { ...patientDetails }
            }
        };

        const result = await ambulanceCollection.updateOne(query, updatedDoc);
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Ambulance not found" });
        }
        res.status(200).json({
            message: "Ambulance updated successfully",
            modifiedCount: result.modifiedCount,
            result
        });
    } catch (error) {
        console.error("Error updating ambulance:", error);
        res.status(500).json({
            message: "Failed to update ambulance",
            error: error.message
        });
    }
})


// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("emergency ambulance starting endpoint");
}); // Api endpoint -> /emergency


export default router;