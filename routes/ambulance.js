
import express from "express";
import { connectDB } from "../config/connectDB.js";


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
        const result = await ambulanceCollection.insertOne({...ambulance});
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


// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("emergency ambulance starting endpoint");
}); // Api endpoint -> /emergency


export default router;