
import express from "express";
import { connectDB } from "../config/connectDB.js";


const router = express.Router();

// Initialize usersCollection
let triageCollection;
async function initCollection() {
    const collections = await connectDB();
    triageCollection = collections.triage;
}
await initCollection();


router.post("/add", async (req, res) => {
    try {
        const triage = req.body;
        const result = await triageCollection.insertOne({status: "waiting", arrivalTime: new Date(),assignedDoctor: null, assignedRoom: null, ...triage});
        res.status(201).send({
            message: "Patient added successfully",
            triage,
            result
        });
    } catch (error) {
        res.status(500).send({
            error: "Failed to add patient. Please try again later."
        });
    }
})


// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("emergency ambulance starting endpoint");
}); // Api endpoint -> /emergency


export default router;