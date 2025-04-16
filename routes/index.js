import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import appointmentRoutes from "./appointments.js";
import banners from "./banners.js";
import paymentsRoutes from "./payments.js";
import bedsRoutes from "./beds.js";
import bed_bookingRoutes from "./bed_booking.js";
import pharmacyRoutes from "./pharmacy.js";
import carts from "./carts.js";
import purchase from "./purchase.js";
import upgradeRequests from "./upgradeRequests.js";
import doctorRoutes from "./doctors.js";
import pharmacistRoutes from "./pharmacist.js";
import salesReportRoutes from "./salesReport.js";
import favorite_doctors from './favorite-doctors.js'
import emergency from './emergency.js'
import ambulance from './emergency.js'

const router = express.Router();

// Root Api route
router.get("/", (req, res) => {
  res.send("Care-Matrix Server Is Running");
});

router.use("/payments", paymentsRoutes); // Payments API
router.use("/auth", authRoutes); // Jwt Api routes
router.use("/users", userRoutes); // Users Api routes
router.use("/appointments", appointmentRoutes); // Appointments Api routes
router.use("/banners", banners); //banner apis routes
router.use("/beds", bedsRoutes); //beds apis routes
router.use("/dashboard/administrator/doctors", doctorRoutes); // API routes of Doctors
router.use("/bed-booking", bed_bookingRoutes); //bed booking apis routes
router.use("/pharmacy", pharmacyRoutes); // pharmacy Api routes
router.use("/pharmacist", pharmacistRoutes); // pharmacist Api routes
router.use("/carts", carts); // carts Api routes
router.use("/purchase", purchase); // purchase Api routes
router.use("/user-requests", upgradeRequests); // Request API routes
router.use("/sales-report", salesReportRoutes); // SalesReport API routes
router.use("/favorite-doctors", favorite_doctors); // Request API routes
router.use("/emergency", emergency) // Emergency API routes
router.use("/ambulance", ambulance) // Ambulance API routes

export default router;
