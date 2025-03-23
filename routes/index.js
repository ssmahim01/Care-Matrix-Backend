import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import appointmentRoutes from "./appointments.js";
import banners from './banners.js';
import doctorRoutes from './doctors.js';
import paymentsRoutes from './payments.js'
import bedsRoutes from './beds.js'
import bed_bookingRoutes from './bed_booking.js'
import pharmacyRoutes from './pharmacy.js'

const router = express.Router();

// Root Api route
router.get("/", (req, res) => {
  res.send("Care-Matrix Server Is Running");
});

router.use("/payments", paymentsRoutes); // Payments API
router.use("/auth", authRoutes); // Jwt Api routes
router.use("/users", userRoutes); // Users Api routes
router.use("/appointments", appointmentRoutes); // Appointments Api routes
router.use("/banners", banners) //banner apis routes 
router.use("/beds", bedsRoutes) //beds apis routes 
router.use("/dashboard/administrator/doctors", doctorRoutes) // API routes of Doctors
router.use("/bed-booking", bed_bookingRoutes) //bed booking apis routes
router.use("/pharmacy", pharmacyRoutes); // pharmacy Api routes

export default router;