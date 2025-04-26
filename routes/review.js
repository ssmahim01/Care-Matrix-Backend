
import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";


const router = express.Router();

// Initialize usersCollection
let reviewCollection;
async function initCollection() {
    const collections = await connectDB();
    reviewCollection = collections.review;
}
await initCollection();


router.post("/add", async (req, res) => {
    try {
        const review = req.body;
        const result = await reviewCollection.insertOne({ ...review });
        res.status(201).send({
            message: "Review added successfully",
            review,
            result
        });
    } catch (error) {
        res.status(500).send({
            error: "Failed to add review. Please try again later."
        });
    }
})



// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("emergency ambulance starting endpoint");
}); // Api endpoint -> /emergency


export default router;