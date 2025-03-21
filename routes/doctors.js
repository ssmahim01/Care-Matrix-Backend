import express from "express";
import { connectDB, collections } from "../config/connectDB.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdministrator from "../middleware/verifyAdministrator.js";
const router = express.Router();

let doctorsCollection;
// Initialize Database Connection and Collections
async function mongoDBCollection() {
    try {
        await connectDB();
        doctorsCollection = collections.doctors;
        console.log("Doctors collection initialized");
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
        console.log(doctors);
        res.status(200).send(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const doctorData = req.body;
        const newDoctor = { ...doctorData, workingHours: "09 AM - 05 PM", leaveStatus: "Available", shift: "Morning" }

        const insertResult = await doctorsCollection.insertOne(newDoctor);
        res.status(201).send({ message: "Doctor added successfully", insertResult});
    } catch (error) {
        res.status(500).send({ message: "Error adding the doctor", error });
    }
})

export default router;