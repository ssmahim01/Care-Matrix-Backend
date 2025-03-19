import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import appointmentRoutes from "./appointments.js";
import banners from './banners.js'

const router = express.Router();

// Root Api routes
router.get("/", (req, res) => {
  res.send("Care-Matrix Server Is Running");
});

router.use("/auth", authRoutes); // Jwt Api routes
router.use("/users", userRoutes); // Users Api routes
router.use("/appointments", appointmentRoutes); // Appointments Api routes
router.use("/banners", banners) //banner apis routes 

export default router;
