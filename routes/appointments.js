import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
const router = express.Router();


router.post("/", async(req, res) => {
  const appointmentInfo = await req.body;
  const result = await collections.appointments.insertOne(appointmentInfo)
  res.send(result)

})
router.get("/", async (req, res) => {
  const result = await collections.appointments.find().toArray()
  res.send(result);
});
// Api endpoint -> /appointment

export default router;
