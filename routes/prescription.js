import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// prescriptionCollection
let prescriptionCollection;
async function initCollection() {
  try {
    const collections = await connectDB();
    prescriptionCollection = collections.prescriptions;
  } catch (error) {
    console.error("Failed to initialize purchase collection:", error);
  }
}
await initCollection();

// appointmentsCollection
let appointmentsCollection;
// Initialize Database Connection and Collections
async function mongoDBCollection() {
  try {
    const collections = await connectDB();
    appointmentsCollection = collections.appointments;
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

await mongoDBCollection();
// console.log(prescriptionCollection);
// add new prescription
router.post("/", async (req, res) => {
  const prescription = req.body;

  // Validate input
  if (
    !prescription ||
    !prescription.appointmentId ||
    !prescription.medicines ||
    !Array.isArray(prescription.medicines)
  ) {
    console.error("Invalid prescription data:", prescription);
    return res.status(400).send({
      error:
        "Prescription data, appointmentId, and medicines array are required",
    });
  }

  try {
    // Create filter for appointment
    const appointmentFilter = { _id: new ObjectId(prescription.appointmentId) };
    // console.log("Appointment filter:", appointmentFilter);

    // Update appointment status
    const updatedDoc = { $set: { status: "Prescribed" } };
    const updateStatus = await appointmentsCollection.updateOne(
      appointmentFilter,
      updatedDoc
    );
    // console.log("Update appointment result:", updateStatus);

    if (updateStatus.matchedCount === 0) {
      //   console.log(
      //     "No appointment found for appointmentId:",
      //     prescription.appointmentId
      //   );
      return res.status(404).send({ error: "Appointment not found" });
    }

    // Check if prescription exists for appointmentId
    const prescriptionFilter = { appointmentId: prescription.appointmentId };
    const existingPrescription = await prescriptionCollection.findOne(
      prescriptionFilter
    );
    // console.log("Existing prescription:", existingPrescription);

    let result;
    if (existingPrescription) {
      // Update existing prescription by appending new medicines
      const updatePrescription = {
        $push: { medicines: { $each: prescription.medicines } },
      };
      result = await prescriptionCollection.updateOne(
        prescriptionFilter,
        updatePrescription
      );
      //   console.log("Update prescription result:", result);
      if (result.matchedCount === 0) {
        return res.status(500).send({ error: "Failed to update prescription" });
      }
      // Return the updated prescription document
      result = await prescriptionCollection.findOne(prescriptionFilter);
    } else {
      // Insert new prescription
      result = await prescriptionCollection.insertOne(prescription);
      //   console.log("Insert prescription result:", result);
    }

    res.send(result);
  } catch (error) {
    console.error("Error processing prescription:", error);
    return res
      .status(400)
      .send({ error: "Invalid appointmentId or operation failed" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { appointmentId: id };
  const result = await prescriptionCollection.findOne(filter);
  res.send(result);
});

export default router;
