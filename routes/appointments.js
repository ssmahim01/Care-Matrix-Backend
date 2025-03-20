import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
const router = express.Router();


router.post("/", async(req, res) => {
  const appointmentInfo = await req.body;
  const result = await collections.appointments.insertOne(appointmentInfo)
  res.send(result)

})
router.get("/", async (req, res) => {
  res.send({ message: "Here is your appointment!" });
});
// Api endpoint -> /appointment

export default router;
