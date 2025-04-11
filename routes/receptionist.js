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
initCollections();

router.get("/stats", async (req, res) => {
    try {
        // Appointment Stats
        const totalAppointments = await appointmentsCollection.estimatedDocumentCount();
        const appointmentStatusBreakdown = await appointmentsCollection
            .aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $project: { _id: 0, status: "$_id", count: 1 } },
                { $sort: { status: 1 } }
            ])
            .toArray();
        const appointmentsPerDoctor = await appointmentsCollection
            .aggregate([
                { $group: { _id: "$doctorName", count: { $sum: 1 } } },
                { $project: { _id: 0, doctor: "$_id", count: 1 } },
                { $sort: { count: -1 } }
            ])
            .toArray();
        const appointmentsPerDate = await appointmentsCollection
            .aggregate([
                { $group: { _id: "$date", count: { $sum: 1 } } },
                { $project: { _id: 0, date: "$_id", count: 1 } },
                { $sort: { date: -1 } },
                { $limit: 7 }
            ])
            .toArray();
        const appointmentsPerReason = await appointmentsCollection
            .aggregate([
                { $group: { _id: "$reason", count: { $sum: 1 } } },
                { $project: { _id: 0, reason: "$_id", count: 1 } },
                { $sort: { count: -1 } }
            ])
            .toArray();
        const currentDate = new Date();
        const nextWeekDate = new Date();
        nextWeekDate.setDate(currentDate.getDate() + 7);
        const upcomingAppointments = await appointmentsCollection.countDocuments({
            date: { $gte: currentDate.toISOString().split("T")[0], $lte: nextWeekDate.toISOString().split("T")[0] },
            status: "Approved"
        });

        // Bed Stats
        const totalBeds = await bedsCollection.estimatedDocumentCount();
        const bedStatusBreakdown = await bedsCollection
            .aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $project: { _id: 0, status: "$_id", count: 1 } },
                { $sort: { status: 1 } }
            ])
            .toArray();
        const bedsPerType = await bedsCollection
            .aggregate([
                { $group: { _id: "$title", count: { $sum: 1 } } },
                { $project: { _id: 0, type: "$_id", count: 1 } },
                { $sort: { count: -1 } }
            ])
            .toArray();

        // Bed Booking Stats
        const totalBedBookings = await bed_bookingCollection.estimatedDocumentCount();
        const bedBookingStatusBreakdown = await bed_bookingCollection
            .aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $project: { _id: 0, status: "$_id", count: 1 } },
                { $sort: { status: 1 } }
            ])
            .toArray();
        const bedBookingsPerType = await bed_bookingCollection
            .aggregate([
                { $group: { _id: "$bedTitle", count: { $sum: 1 } } },
                { $project: { _id: 0, bedType: "$_id", count: 1 } },
                { $sort: { count: -1 } }
            ])
            .toArray();
        const bedBookingsPerAdmissionDate = await bed_bookingCollection
            .aggregate([
                { $group: { _id: "$admissionDate", count: { $sum: 1 } } },
                { $project: { _id: 0, admissionDate: "$_id", count: 1 } },
                { $sort: { admissionDate: -1 } },
                { $limit: 7 }
            ])
            .toArray();
        const upcomingAdmissions = await bed_bookingCollection.countDocuments({
            admissionDate: { $gte: currentDate.toISOString().split("T")[0], $lte: nextWeekDate.toISOString().split("T")[0] },
            status: "Approved"
        });

        res.send({
            // Appointment Stats
            totalAppointments,
            totalPendingAppointments: appointmentStatusBreakdown.find(s => s.status === "pending")?.count || 0,
            totalApprovedAppointments: appointmentStatusBreakdown.find(s => s.status === "Approved")?.count || 0,
            upcomingAppointments,
            // Charts Data for Appointments
            appointmentStatusBreakdown,
            appointmentsPerDoctor,
            appointmentsPerDate,
            appointmentsPerReason,
            // Bed Stats
            totalBeds,
            totalAvailableBeds: bedStatusBreakdown.find(s => s.status === "available")?.count || 0,
            totalOccupiedBeds: bedStatusBreakdown.find(s => s.status === "booked")?.count || 0,
            totalRequestedBeds: bedStatusBreakdown.find(s => s.status === "requested")?.count || 0,
            // Charts Data for Beds
            bedStatusBreakdown,
            bedsPerType,
            // Bed Booking Stats
            totalBedBookings,
            totalPendingBedBookings: bedBookingStatusBreakdown.find(s => s.status === "pending")?.count || 0,
            totalApprovedBedBookings: bedBookingStatusBreakdown.find(s => s.status === "accepted")?.count || 0,
            upcomingAdmissions,
            // Charts Data for Bed Bookings
            bedBookingStatusBreakdown,
            bedBookingsPerType,
            bedBookingsPerAdmissionDate
        });
    } catch (error) {
        console.error("Error fetching receptionist stats:", error);
        res.status(500).send({ message: "Failed to fetch receptionist stats" });
    }
});

export default router;