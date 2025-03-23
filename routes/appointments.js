import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

router.post("/", async(req, res) => {
  const appointmentInfo = await req.body;
  const result = await collections.appointments.insertOne(appointmentInfo)
  res.send(result)

})
router.get("/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const result = await collections.appointments.find().toArray()
  res.send(result);
});

router.delete("/:id", async(req, res)=>{
 const id = req.params.id;
 const query = {_id: new ObjectId(id)}
 const result = await collections.appointments.deleteOne(query)
 res.send(result)
})
// Api endpoint -> /appointment

export default router;
