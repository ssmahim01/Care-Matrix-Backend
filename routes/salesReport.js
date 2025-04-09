import express from "express";
import { connectDB } from "../config/connectDB.js";
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
        // { $limit: 5 },
      ])
      .toArray();

    const topCustomers = await purchaseCollection
      .aggregate([
        {
          $group: {
            _id: "$customerInfo.email",
            name: { $first: "$customerInfo.name" },
            phone: { $first: "$customerInfo.phone" },
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: { $toDouble: "$totalPrice" } },
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            email: "$_id",
            phone: 1,
            totalOrders: 1,
            totalSpent: 1,
          },
        },
        { $sort: { totalOrders: -1 } },
        // { $limit: 5 }
      ])
      .toArray();

    const revenuePerDivision = await purchaseCollection
      .aggregate([
        {
          $group: {
            _id: "$customerInfo.division",
            totalRevenue: { $sum: { $toDouble: "$totalPrice" } },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ])
      .toArray();

    res.send({
      totalOrders: totalOrders,
      totalPendingOrders: totalPendingOrders,
      totalDeliveredOrders: totalDeliveredOrders,
      totalRevenue: totalRevenue[0]?.totalRevenue,
      revenuePerDay: revenuePerDay,
      topSellingMedicines: topSellingMedicines,
      topCustomers: topCustomers,
      revenuePerDivision: revenuePerDivision,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
