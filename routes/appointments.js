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
router.post("/", async(req, res) => {
  const appointmentInfo = await req.body;
  const result = await collections.appointments.insertOne(appointmentInfo)
  res.send(result)

})

// Get appointments for receptionists
router.get("/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email);
  const result = await collections.appointments.find().toArray()
  res.send(result);
});

router.delete("/:id", async(req, res)=>{
 const id = req.params.id;
 const query = {_id: new ObjectId(id)}
 const result = await collections.appointments.deleteOne(query)
 res.send(result)
})

router.patch("/:id", async(req, res) => {
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}
  const updatedStatus = {
    $set:{
      status: "Approved"
    }
  }

  const result = await appointmentsCollection.updateOne(filter, updatedStatus);

  res.send(result)

})


// Get appointments for patients
router.get('/patients/:email', async(req, res)=>{
  const email = req.params.email;
  const query = {email: email}
  const result = await appointmentsCollection.find(query).toArray()
  res.send(result)
})

// Api endpoint -> /appointment

export default router;
