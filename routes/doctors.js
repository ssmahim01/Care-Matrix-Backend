import express from "express";
import { connectDB, collections } from "../config/connectDB.js";
const router = express.Router();

let doctorsCollection;
// Initialize Database Connection and Collections
async function mongoDBCollection() {
    try {
        await connectDB();
        doctorsCollection = collections.doctors;
        // console.log("Doctors collection initialized", doctorsCollection);
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

// Ensure the database is initialized before handling routes
mongoDBCollection();

router.get("/", async (req, res) => {
    try {
        if (!doctorsCollection) {
            return res.status(500).send({ message: "Doctors collection is unavailable" });
        }

        const doctors = await doctorsCollection.find().toArray();
        // console.log(doctors);
        res.status(200).send(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;