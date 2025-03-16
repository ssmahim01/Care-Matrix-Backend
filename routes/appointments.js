import express from "express";
import { collections } from "../config/connectDB.js";
const router = express.Router();

router.get("/", async (req, res) => {
  res.send({ message: "Here is your appointment!" });
});
// Api endpoint -> /appointment

export default router;
