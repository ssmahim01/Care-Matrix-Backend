import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

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

router.get("/", async (req, res) => {
  try {
    const totalOrders = await purchaseCollection.countDocuments();
    const totalPendingOrders = await purchaseCollection.countDocuments({
      orderStatus: "Pending",
    });
    const totalDeliveredOrders = await purchaseCollection.countDocuments({
      orderStatus: "Delivered",
    });

    const totalRevenue = await purchaseCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $toDouble: "$totalPrice" } },
          },
        },
      ])
      .toArray();

    const revenuePerDay = await purchaseCollection
      .aggregate([
        {
          $addFields: {
            date: { $toDate: "$date" },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
            total: { $sum: { $toDouble: "$totalPrice" } },
          },
        },
        {
          $project: {
            date: "$_id",
            total: 1,
            _id: 0,
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const topSellingMedicines = await purchaseCollection
      .aggregate([
        { $unwind: "$medicines" },
        {
          $group: {
            _id: "$medicines.medicineName",
            totalQty: { $sum: "$medicines.quantity" },
          },
        },
        {
          $project: {
            medicine: "$_id",
            totalQty: 1,
            _id: 0,
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    res.send({
      totalOrders: totalOrders,
      totalPendingOrders: totalPendingOrders,
      totalDeliveredOrders: totalDeliveredOrders,
      totalRevenue: totalRevenue[0]?.totalRevenue,
      revenuePerDay: revenuePerDay,
      topSellingMedicines: topSellingMedicines,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
