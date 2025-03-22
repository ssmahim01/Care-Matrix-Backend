import express from "express";
import { connectDB, collections } from "../config/connectDB.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdministrator from "../middleware/verifyAdministrator.js";
import { ObjectId } from "mongodb";
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
        res.status(200).send(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    try {
        if (!doctorsCollection) {
            return res.status(500).send({ message: "Doctors collection is unavailable" });
        }

        const doctor = await doctorsCollection.findOne(query);
        console.log(doctor);
        res.status(200).send(doctor);
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

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    try {
        const deleteResult = await doctorsCollection.deleteOne(query);
       res.status(200).send({ message: "Doctor deleted successfully", deleteResult});
    } catch (error) {
        res.status(500).send({ message: "Error deleting doctor", error });
    }
})

router.put("/:id", async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const doctorData = req.body;

    try {
        const options = {upsert: true};
        const updatedData = {
            $set: {doctorData}
        }

        const updateResult = await doctorsCollection.updateOne(query, updatedData, options);

        res.status(200).send({message: "Updated doctor info", updateResult});
    } catch (error) {
        res.status(500).send({message: "Error updating doctor", error});
    }
})

export default router;