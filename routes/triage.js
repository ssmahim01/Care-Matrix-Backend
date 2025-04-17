
import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";


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
        const result = await triageCollection.insertOne({ status: "waiting", arrivalTime: new Date(), assignedDoctor: null, assignedRoom: null, ...triage });
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

router.get("/all-triage", async (req, res) => {
    const results = await triageCollection.find().toArray();
    res.send(results)
})

router.delete("/delete-triage/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    if (!id) return res.send({ message: "Id is required" })

    const result = await triageCollection.deleteOne(query)

    if (result.deletedCount === 1) {
        res.send({ message: "Successfully deleted." });
    } else {
        res.send({ message: "No id matched the query." });
    }
})


// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("emergency ambulance starting endpoint");
}); // Api endpoint -> /emergency


export default router;