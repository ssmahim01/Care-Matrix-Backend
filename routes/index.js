import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import appointmentRoutes from "./appointments.js";

const router = express.Router();

// Root Api routes
router.get("/", (req, res) => {
  res.send("Care-Matrix Server Is Running");
});

router.use("/auth", authRoutes); // Jwt Api routes
router.use("/users", userRoutes); // Users Api routes
router.use("/appointments", appointmentRoutes); // Appointments Api routes

export default router;
