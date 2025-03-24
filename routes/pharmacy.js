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

router.post("/medicine", async (req, res) => {
  try {
    const medicine = req.body;
    const result = await medicinesCollection.insertOne(medicine);
    res.send({
      data: result,
      message: "Medicine Added To DB Successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/medicines", async (req, res) => {
  try {
    const search = req.query.search || "";
    const category = req.query.category || "All Medicines";

    const limit = 8;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = {};
    if (category !== "All Medicines") query.category = category;
    if (search) query.brandName = { $regex: search, $options: "i" };

    const total = await medicinesCollection.countDocuments(query);
    const result = await medicinesCollection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

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

    res.send({
      medicines,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/medicine/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await medicinesCollection.findOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/manage-medicines", async (req, res) => {
  try {
    const sort = req.query.sort || "";
    const search = req.query.search || "";
    const category = req.query.category || "All Medicines";

    const limit = 8;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = {};
    if (category !== "All Medicines") query.category = category;
    if (search) query.brandName = { $regex: search, $options: "i" };

    const sortOptions = {};
    if (sort === "price-asc") sortOptions["price.amount"] = 1;
    if (sort === "price-desc") sortOptions["price.amount"] = -1;
    if (sort === "discountedPrice-asc")
      sortOptions["price.discount.discountedAmount"] = 1;
    if (sort === "discountedPrice-desc")
      sortOptions["price.discount.discountedAmount"] = -1;
    if (sort === "manufactureDate-asc") sortOptions["manufactureDate"] = 1;
    if (sort === "manufactureDate-desc") sortOptions["manufactureDate"] = -1;
    if (sort === "expiryDate-asc") sortOptions["expiryDate"] = 1;
    if (sort === "expiryDate-desc") sortOptions["expiryDate"] = -1;

    const result = await medicinesCollection
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalMedicines = await medicinesCollection.countDocuments(query);
    const totalPages = Math.ceil(totalMedicines / limit);

    res.send({ totalPages, currentPage: page, medicines: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.delete("/delete-medicine/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await medicinesCollection.deleteOne(query);
    res.send({
      data: result,
      message: "Medicine Deleted Successfully!",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
