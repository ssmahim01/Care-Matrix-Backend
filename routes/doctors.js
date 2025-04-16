import express from "express";
import { connectDB, collections } from "../config/connectDB.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdministrator from "../middleware/verifyAdministrator.js";
import { ObjectId } from "mongodb";
import moment from "moment";
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

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    try {
        if (!doctorsCollection) {
            return res.status(500).send({ message: "Doctors collection is unavailable" });
        }

        const doctor = await doctorsCollection.findOne(query);
        // console.log(doctor);
        res.status(200).send(doctor);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const doctorData = req.body;
        // console.log("Received doctorData:", doctorData);

        if (!doctorData.name || !doctorData.email || !doctorData.schedule || !doctorData.shift || !doctorData.services) {
            console.log("Validation failed: Missing required fields");
            return res.status(400).send({ message: "Missing required fields: name, email, schedule, shift, or services" });
        }

        const newDoctor = {
            ...doctorData,
            chamber: "CareMatrix"
        }

        const insertResult = await doctorsCollection.insertOne(newDoctor);
        res.status(201).send({ message: "Doctor added successfully", insertResult });

    } catch (error) {
        console.error("Error adding the doctor:", error);
        res.status(500).send({ message: "Error adding the doctor", error: error.message });
    }
});

router.delete("/:email", async (req, res) => {
    const email = req.params.email;
    const query = {email};
    try {
        const deleteResult = await doctorsCollection.deleteOne(query);
       res.status(200).send({ message: "Doctor deleted successfully", deleteResult});
    } catch (error) {
        res.status(500).send({ message: "Error deleting doctor", error });
    }
})

router.put("/update-availability/:id", async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const updatedAvailability = req.body;

    try {
        const options = {upsert: true};
        const updatedData = {
            $set: {updatedAvailability}
        }

        const updateResult = await doctorsCollection.updateOne(query, updatedData, options);

        res.status(200).send({message: "Updated doctor info", updateResult});
    } catch (error) {
        res.status(500).send({message: "Error updating doctor", error});
    }
})

export default router;