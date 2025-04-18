import express from "express";
import { connectDB } from "../config/connectDB.js";
const router = express.Router();

let paymentsCollection;
async function initCollection() {
  try {
    const dbCollections = await connectDB();
    if (!dbCollections?.payments) {
      throw new Error("Payments collection not initialized.");
    }
    paymentsCollection = dbCollections.payments;
  } catch (error) {
    console.error("Failed to initialize payments collection:", error.message);
  }
}
initCollection();

router.get("/", async (req, res) => {
  try {
    const data = await paymentsCollection
      .aggregate([
        {
          $match: {
            paymentStatus: "succeeded",
          },
        },
        {
          $addFields: {
            amountInt: { $toInt: "$amount" },
            paymentDateObj: { $toDate: "$paymentDate" },
          },
        },
        {
          $facet: {
            totalRevenue: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$amountInt" },
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                },
              },
            ],
            revenueByDay: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$paymentDateObj",
                    },
                  },
                  totalRevenue: { $sum: "$amountInt" },
                  appointments: { $sum: 1 },
                },
              },
              {
                $project: {
                  date: "$_id",
                  totalRevenue: 1,
                  appointments: 1,
                  _id: 0,
                },
              },
              { $limit: 7 },
            ],
            revenueByAllDates: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$paymentDateObj",
                    },
                  },
                  totalRevenue: { $sum: "$amountInt" },
                  appointments: { $sum: 1 },
                },
              },
              {
                $project: {
                  date: "$_id",
                  totalRevenue: 1,
                  appointments: 1,
                  _id: 0,
                },
              },
              { $sort: { date: -1 } },
            ],
            doctorPerformance: [
              {
                $group: {
                  _id: "$appointmentInfo.doctorName",
                  totalRevenue: { $sum: "$amountInt" },
                  appointments: { $sum: 1 },
                  avgFee: { $avg: "$amountInt" },
                  doctorTitle: { $first: "$appointmentInfo.doctorTitle" },
                },
              },
              {
                $project: {
                  doctor: "$_id",
                  totalRevenue: 1,
                  appointments: 1,
                  avgFee: 1,
                  doctorTitle: 1,
                  _id: 0,
                },
              },
              { $sort: { total: -1 } },
            ],
            topPatients: [
              {
                $group: {
                  _id: "$appointmentInfo.email",
                  patientName: { $first: "$appointmentInfo.name" },
                  totalSpent: { $sum: "$amountInt" },
                  appointments: { $sum: 1 },
                },
              },
              {
                $project: {
                  patientEmail: "$_id",
                  patientName: 1,
                  totalSpent: 1,
                  appointments: 1,
                  _id: 0,
                },
              },
              { $sort: { totalSpent: -1 } },
              { $limit: 5 },
            ],
            uniquePatients: [
              {
                $group: {
                  _id: "$appointmentInfo.email",
                },
              },
              {
                $count: "count",
              },
            ],
            appointmentsToday: [
              {
                $match: {
                  "appointmentInfo.date": new Date()
                    .toISOString()
                    .split("T")[0],
                },
              },
              {
                $count: "count",
              },
            ],
          },
        },
      ])
      .toArray();

    const totalAppointments = await paymentsCollection.countDocuments();
    const avgRevenuePerAppointment = (
      data[0].totalRevenue[0].total / totalAppointments
    ).toFixed(2);

    const avgRevenuePerDates = (
      data[0].totalRevenue[0].total / data[0].revenueByAllDates.length
    ).toFixed(2);

    res.json({
      totalRevenue: data[0].totalRevenue[0].total,
      uniquePatients: data[0].uniquePatients[0].count,
      appointmentsToday: data[0].appointmentsToday[0].count,
      avgRevenuePerAppointment: parseInt(avgRevenuePerAppointment),
      avgRevenuePerDates: parseInt(avgRevenuePerDates),
      totalAppointments: totalAppointments,
      revenueByDay: data[0].revenueByDay,
      revenueByAllDates: data[0].revenueByAllDates,
      doctorPerformance: data[0].doctorPerformance,
      topPatients: data[0].topPatients,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
