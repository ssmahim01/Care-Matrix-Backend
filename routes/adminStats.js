import express from "express";
import { connectDB } from "../config/connectDB.js";
const router = express.Router();

// Initialize collections
let appointmentsCollection;
let bedsCollection;
let bed_bookingCollection;

async function initCollections() {
  try {
    const collections = await connectDB();
    appointmentsCollection = collections.appointments;
    bedsCollection = collections.beds;
    bed_bookingCollection = collections.bed_booking;
  } catch (error) {
    console.error("Failed to initialize collections:", error);
  }
}
await initCollections();
// Initialize purchaseCollection
let purchaseCollection;
async function initCollection() {
  try {
    const collections = await connectDB();
    purchaseCollection = collections.purchase;
  } catch (error) {
    console.error("Failed to initialize purchase collection:", error);
  }
}
await initCollection();

// Initialize purchaseCollection
let usersCollection;
async function initUsersCollection() {
  try {
    const collections = await connectDB();
    usersCollection = collections.users;
  } catch (error) {
    console.error("Failed to initialize users collection:", error);
  }
}
await initUsersCollection();

router.get("/", async (req, res) => {
  try {
    // Execute all aggregations concurrently
    const [revenuePerDay, appointmentsPerDate, bedBookingsPerAdmissionDate] =
      await Promise.all([
        purchaseCollection
          .aggregate([
            {
              $addFields: {
                date: { $toDate: "$date" },
                totalQty: {
                  $sum: {
                    $map: {
                      input: "$medicines",
                      as: "m",
                      in: "$$m.quantity",
                    },
                  },
                },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                totalQty: { $sum: "$totalQty" },
                totalRevenue: { $sum: { $toDouble: "$totalPrice" } },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: "$_id",
                totalRevenue: 1,
                totalQty: 1,
                _id: 0,
              },
            },
          ])
          .toArray(),

        appointmentsCollection
          .aggregate([
            { $group: { _id: "$date", count: { $sum: 1 } } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
            { $sort: { date: -1 } },
            { $limit: 7 },
          ])
          .toArray(),

        bed_bookingCollection
          .aggregate([
            { $group: { _id: "$admissionDate", count: { $sum: 1 } } },
            { $project: { _id: 0, admissionDate: "$_id", count: 1 } },
            { $sort: { admissionDate: -1 } },
            { $limit: 7 },
          ])
          .toArray(),
      ]);

    // Return combined results
    res.status(200).json({
      status: "success",
      data: {
        revenuePerDay,
        appointmentsPerDate,
        bedBookingsPerAdmissionDate,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch statistics",
    });
  }
});

export default router;
