import express from "express";
import { collections } from "../config/connectDB.js";
const router = express.Router();

router.get("/", async (req, res) => {
  res.send({ message: "hello from doctor!" });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  res.send({ message: `doctor: ${id}` });
});

router.post("/", async (req, res) => {
  res.send({
    message: "doctors Added Successfully!",
  });
});

router.put("/update-doctor/:id", async (req, res) => {
  const id = req.params.id;
  res.send({
    message: `doctor: '${id}' Updated Successfully!`,
  });
});

router.delete("/delete-doctor/:email", async (req, res) => {
  const email = req.params.email;
  res.send({
    message: `doctor: '${email}' Deleted Successfully!`,
  });
});

export default router;
