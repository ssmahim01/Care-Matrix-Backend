// pharmacist-stats related CRUD

import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// Initialize collections
let medicinesCollection;
async function initMedicinesCollection() {
  try {
    const collections = await connectDB();
    medicinesCollection = collections.medicines;
  } catch (error) {
    console.error("Failed to initialize medicines collection:", error);
  }
}
initMedicinesCollection();

let cartsCollection;
async function initCartsCollection() {
  try {
    const collection = await connectDB();
    cartsCollection = collection.carts;
  } catch (error) {
    console.error("Failed to initialize carts collection:", error);
  }
}
await initCartsCollection();

let bannersCollection;
async function initBannersCollection() {
  try {
    const collection = await connectDB();
    bannersCollection = collection.banners;
  } catch (error) {
    console.error("Failed to initialize banners collection:", error);
  }
}
await initBannersCollection();

router.get("/stats", async (req, res) => {
  const totalBanners = await bannersCollection.estimatedDocumentCount();
  const totalActive = await bannersCollection.countDocuments({
    status: "active",
  });
  const totalInActive = await bannersCollection.countDocuments({
    status: "inactive",
  });
  const totalMedicines = await medicinesCollection.estimatedDocumentCount();
  const totalInStockMedicines = await medicinesCollection.countDocuments({
    availabilityStatus: "In Stock",
  });
  const totalLimitedStockMedicines = await medicinesCollection.countDocuments({
    availabilityStatus: "Limited Stock",
  });
  const totalOutOFStockMedicines = await medicinesCollection.countDocuments({
    availabilityStatus: "Out Of Stock",
  });

  const medicinesPerCategory = await medicinesCollection
    .aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
    ])
    .toArray();

  const medicinesPerManufacturer = await medicinesCollection
    .aggregate([
      { $group: { _id: "$manufacturer.name", count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          manufacturer: "$_id",
          count: 1,
        },
      },
    ])
    .toArray();

  const medicinesPerSupplier = await medicinesCollection
    .aggregate([
      { $group: { _id: "$supplier.name", count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          manufacturer: "$_id",
          count: 1,
        },
      },
    ])
    .toArray();

  res.send({
    totalBanners,
    totalActive,
    totalInActive,
    totalMedicines,
    totalInStockMedicines,
    totalLimitedStockMedicines,
    totalOutOFStockMedicines,
    medicinesPerCategory,
    medicinesPerManufacturer,
    medicinesPerSupplier,
  });
});

export default router;
