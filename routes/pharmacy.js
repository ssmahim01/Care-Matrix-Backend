// pharmacy related CRUD

import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// Initialize medicinesCollection
let medicinesCollection;
async function initCollection() {
  try {
    const collections = await connectDB();
    medicinesCollection = collections.medicines;
  } catch (error) {
    console.error("Failed to initialize medicines collection:", error);
  }
}
await initCollection();

router.get("/medicines", async (req, res) => {
  try {
    const search = req.query.search || "";
    const category = req.query.category || "All Medicines";

    const query = {};
    if (category !== "All Medicines") query.category = category;
    if (search) query.brandName = { $regex: search, $options: "i" };

    const result = await medicinesCollection.find(query).toArray();
    const medicines = result.map((medicine) => ({
      _id: medicine?._id,
      brandName: medicine?.brandName,
      strength: medicine?.strength,
      price: {
        amount: medicine?.price?.amount,
        discountedAmount: medicine?.price?.discount?.discountedAmount,
      },
      imageURL: medicine?.imageURL,
    }));

    res.send(medicines);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
