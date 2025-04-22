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
    doctorCollection = collections.payments;
  } catch (error) {
    console.error("Failed to initialize payments collection:", error);
  }
}
await initPaymentsCollection();

async function initPrescriptionsCollection() {
  try {
    const collections = await connectDB();
    doctorCollection = collections.prescriptions;
  } catch (error) {
    console.error("Failed to initialize prescriptions collection:", error);
  }
}
await initPrescriptionsCollection();

router.get("/:email", async (req, res) => {
  const email = req.params.email;
  res.send(`${email} Doctor Stats Coming Soon...`);
});

export default router;
