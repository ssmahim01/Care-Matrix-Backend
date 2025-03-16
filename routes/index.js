import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import doctorRoutes from "./doctors.js";
import appointmentRoutes from "./appointments.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Care-Matrix Server Is Running");
});

router.use("/auth", authRoutes)
router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);

export default router;
