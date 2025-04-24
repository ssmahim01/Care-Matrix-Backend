import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

let appointmentsCollection;
// Initialize Database Connection and Collections
async function mongoDBCollection() {
  try {
    await connectDB();
    appointmentsCollection = collections.appointments;
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Ensure the database is initialized before handling routes
mongoDBCollection();

// Book appointments 
router.post("/", async (req, res) => {
  const appointmentInfo = await req.body;
  const result = await collections.appointments.insertOne(appointmentInfo)
  res.send(result)

})

// Get appointments for receptionists
router.get("/:email", async (req, res) => {
  const email = req.params.email;
  const sortFormat = req.query.sort;

  let query = {};
  let cursor = appointmentsCollection.find(query)
  if (sortFormat === "asc") {
    cursor = cursor.sort({ date: 1 }); // ascending
  } else if (sortFormat === "desc") {
    cursor = cursor.sort({ date: -1 }); // descending
  }
  const result = await cursor.toArray()
  res.send(result)
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await appointmentsCollection.deleteOne(query)
  res.send(result)
})

router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const appointment = await appointmentsCollection.findOne(filter)

  const newStatus = appointment.status === "pending" ? "Approved" : "pending"
  const updatedStatus = {
    $set: {
      status: newStatus
    }
  }

  const result = await appointmentsCollection.updateOne(filter, updatedStatus);

  if (newStatus === "Approved") {
    res.send({ result, message: "approved" })
  } else {
    res.send({ result, message: "pending" })
  }

})


// Get appointments for patients
router.get('/patients/:email', async (req, res) => {
  const email = req.params.email;
  const sortFormat = req.query.sort;
  let query = { email: email }

  let cursor = appointmentsCollection.find(query);

  if (sortFormat === "asc") {
    cursor = cursor.sort({ date: 1 }); // ascending
  } else if (sortFormat === "desc") {
    cursor = cursor.sort({ date: -1 }); // descending
  }
  const result = await cursor.toArray()
  res.send(result)
})

// Appointments for doctor 
router.get('/doctors/:email', async (req, res) => {
  const email = req.params.email;
  const sortFormat = req?.query?.sort;
  const search = req.query.search;
  const category = req.query.category;
  const doctorsCollection = collections.doctors;
  const doctor = await doctorsCollection.findOne({ email: email })
  const doctor_id = doctor?._id.toString();
  const query = { doctorId: doctor_id, status: 'Approved' }

  // If search exists, add regex query for name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  let cursor = appointmentsCollection.find(query);

  // Date-based filtering
  const today = new Date().toISOString().split('T')[0]; // e.g. "2025-04-18"

  if (category === "upcoming") {
    query.date = { $gt: today }; // upcoming = future
  } else if (category === "past") {
    query.date = { $lt: today }; // past = before today
  }

  if (sortFormat === "asc") {
    cursor = cursor.sort({ date: 1 })
  } else if (sortFormat === "desc") {
    cursor = cursor.sort({ date: -1 })
  }
  const result = await cursor.toArray()
  res.send(result)
})



// Api endpoint -> /appointment

export default router;
