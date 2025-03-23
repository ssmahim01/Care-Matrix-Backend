import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import appointmentRoutes from "./appointments.js";
import banners from './banners.js';
import doctorRoutes from './doctors.js';
import paymentsRoutes from './payments.js'

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Care-Matrix Server Is Running");
});

router.use("/auth", authRoutes); //Auth API
router.use("/users", userRoutes); //Users API
router.use("/appointments", appointmentRoutes); // Appointments API
router.use("/banners", banners); // Banner API
router.use("/dashboard/administrator/doctors", doctorRoutes); // Doctors API
router.use("/payments", paymentsRoutes); // Payments API

export default router;
