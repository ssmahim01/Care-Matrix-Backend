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
        // console.log(doctorData);

        // Validate required fields
        if (!doctorData.name || !doctorData.email || !doctorData.schedule || !doctorData.available_days) {
            return res.status(400).send({ message: "Missing required fields: name, email, schedule, or available_days" });
        }

        // Default working hours
        const workingHours = "09 AM - 05 PM";

        // Determine status
        const status = doctorData?.available_days.length > 0 ? "Available" : "Unavailable";

        // Parse schedule time correctly
        const scheduleTime = moment(doctorData?.schedule).utcOffset("+06:00").format("HH:mm");
        const hour = parseInt(scheduleTime.split(":")[0]);

        // Determine shift
        let shift = "Morning";
        if (hour >= 12 && hour < 17) shift = "Afternoon";
        else if (hour >= 17) shift = "Evening";

        // Create new doctor object with additional fields
        const newDoctor = {
            ...doctorData,
            workingHours,
            status,
            shift
        };

        // Insert into database
        const insertResult = await doctorsCollection.insertOne(newDoctor);
        res.status(201).send({ message: "Doctor added successfully", insertResult });

    } catch (error) {
        res.status(500).send({ message: "Error adding the doctor", error });
    }
});

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