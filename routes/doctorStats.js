import express from "express";
import { connectDB } from "../config/connectDB.js";
const router = express.Router();

// Initialize All COllections
let doctorCollection;
let paymentsCollection;
let prescriptionsCollection;

async function initDoctorCollection() {
  try {
    const collections = await connectDB();
    doctorCollection = collections.doctors;
  } catch (error) {
    console.error("Failed to initialize doctors collection:", error);
  }
}
await initDoctorCollection();

async function initPaymentsCollection() {
  try {
    const collections = await connectDB();
    paymentsCollection = collections.payments;
  } catch (error) {
    console.error("Failed to initialize payments collection:", error);
  }
}
await initPaymentsCollection();

async function initPrescriptionsCollection() {
  try {
    const collections = await connectDB();
    prescriptionsCollection = collections.prescriptions;
  } catch (error) {
    console.error("Failed to initialize prescriptions collection:", error);
  }
}
await initPrescriptionsCollection();

router.get("/:email", async (req, res) => {
  const email = req.params.email;
  if (!email) return res.status(400).json({ message: "Email Is Required" });

  
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching doctor overview:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
