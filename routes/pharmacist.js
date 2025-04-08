// pharmacist-stats related CRUD

import express from "express";
import { connectDB } from "../config/connectDB.js";
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
  try {
    // Banner Stats
    const totalBanners = await bannersCollection.estimatedDocumentCount();
    const totalActive = await bannersCollection.countDocuments({
      status: "active",
    });
    const totalInActive = await bannersCollection.countDocuments({
      status: "inactive",
    });

    // Medicine Stats
    const totalMedicines = await medicinesCollection.estimatedDocumentCount();
    const totalInStockMedicines = await medicinesCollection.countDocuments({
      availabilityStatus: "In Stock",
    });
    const totalLimitedStockMedicines = await medicinesCollection.countDocuments(
      { availabilityStatus: "Limited Stock" }
    );
    const totalOutOFStockMedicines = await medicinesCollection.countDocuments({
      availabilityStatus: "Out Of Stock",
    });

    // Category Breakdown
    const medicinesPerCategory = await medicinesCollection
      .aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Manufacturer Breakdown
    const medicinesPerManufacturer = await medicinesCollection
      .aggregate([
        { $group: { _id: "$manufacturer.name", count: { $sum: 1 } } },
        { $project: { _id: 0, manufacturer: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Supplier Breakdown
    const medicinesPerSupplier = await medicinesCollection
      .aggregate([
        { $group: { _id: "$supplier.name", count: { $sum: 1 } } },
        { $project: { _id: 0, supplier: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Storage Condition Breakdown
    const storageConditionStats = await medicinesCollection
      .aggregate([
        { $group: { _id: "$storageConditions", count: { $sum: 1 } } },
        { $project: { _id: 0, condition: "$_id", count: 1 } },
      ])
      .toArray();

    // Prescription Required vs Not
    const prescriptionStats = await medicinesCollection
      .aggregate([
        { $group: { _id: "$prescriptionRequired", count: { $sum: 1 } } },
        {
          $project: {
            _id: 0,
            prescriptionRequired: "$_id",
            count: 1,
          },
        },
      ])
      .toArray();

    // Expiry Summary
    const currentDate = new Date();
    const nearExpiryDate = new Date();
    nearExpiryDate.setMonth(nearExpiryDate.getMonth() + 1);

    const expiredCount = await medicinesCollection.countDocuments({
      expiryDate: { $lt: currentDate },
    });

    const nearExpiryCount = await medicinesCollection.countDocuments({
      expiryDate: { $gte: currentDate, $lte: nearExpiryDate },
    });

    res.send({
      // banner stats
      totalBanners,
      totalActive,
      totalInActive,
      // medicines starts
      totalMedicines,
      totalInStockMedicines,
      totalLimitedStockMedicines,
      totalOutOFStockMedicines,
      expiredCount,
      nearExpiryCount,
      // charts data
      medicinesPerCategory,
      medicinesPerManufacturer,
      medicinesPerSupplier,
      storageConditionStats,
      prescriptionStats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).send({ message: "Failed to fetch stats" });
  }
});

export default router;
