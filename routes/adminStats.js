import express from "express";
import { connectDB } from "../config/connectDB.js";
const router = express.Router();

// Initialize collections
let appointmentsCollection;
let bedsCollection;
let bed_bookingCollection;
let purchaseCollection;
let usersCollection;

async function initCollections() {
  try {
    const collections = await connectDB();
    appointmentsCollection = collections.appointments;
    bedsCollection = collections.beds;
    bed_bookingCollection = collections.bed_booking;
    purchaseCollection = collections.purchase;
    usersCollection = collections.users;
  } catch (error) {
    console.error("Failed to initialize collections:", error);
  }
}
await initCollections();

// Existing route for stats (unchanged)
router.get("/", async (req, res) => {
  try {
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

// New route for totals (unchanged)
router.get("/totals", async (req, res) => {
  try {
    const userCounts = await usersCollection
      .aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            role: "$_id",
            count: 1,
          },
        },
      ])
      .toArray();

    const totalPatients = userCounts.find((item) => item.role === "patient")?.count || 0;
    const totalDoctors = userCounts.find((item) => item.role === "doctor")?.count || 0;

    res.status(200).json({
      status: "success",
      data: {
        totalPatients,
        totalDoctors,
      },
    });
  } catch (error) {
    console.error("Error fetching totals:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch totals",
    });
  }
});

// Updated route for recent activities
router.get("/recent-activities", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [
      recentDoctor,
      appointmentsToday,
      recentPendingAppointment,
      bedBookingsAcceptedToday,
    ] = await Promise.all([
      // Recently added doctor
      usersCollection
        .find({ role: "doctor" })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray(),

      // Appointments registered today
      appointmentsCollection
        .aggregate([
          {
            $match: {
              date: today,
              status: "Approved",
            },
          },
          {
            $count: "total",
          },
        ])
        .toArray(),

      // Recently canceled appointment
      appointmentsCollection
        .find({ status: "pending" })
        .sort({ updatedAt: -1 })
        .limit(1)
        .toArray(),

      // Bed bookings accepted today
      bed_bookingCollection
        .aggregate([
          {
            $match: {
              admissionDate: today,
              status: "accepted",
            },
          },
          {
            $count: "total",
          },
        ])
        .toArray(),
    ]);

    // Process the canceled appointment ID
    const modifiedPendingId =
      recentPendingAppointment.length > 0
        ? `p${String(recentPendingAppointment[0]._id).slice(0, 4)}`
        : null;

    const recentActivities = [
      recentDoctor.length > 0
        ? `🟢 New doctor ${recentDoctor[0].name} joined the hospital`
        : null,
      appointmentsToday.length > 0
        ? `🟢 ${appointmentsToday[0].total} new appointment registrations today`
        : `🟢 0 new appointment registrations today`,
      recentPendingAppointment.length > 0
        ? `🟡 Appointment #${modifiedPendingId} is pending`
        : null,
      bedBookingsAcceptedToday.length > 0
        ? `🟢 ${bedBookingsAcceptedToday[0].total} bed bookings accepted today`
        : `🟢 0 bed bookings accepted today`,
    ].filter((activity) => activity !== null);

    res.status(200).json({
      status: "success",
      data: {
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch recent activities",
    });
  }
});

export default router;