import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// Initialize purchaseCollection
let purchaseCollection;
async function initCollection() {
  try {
    const collections = await connectDB();
    purchaseCollection = collections.purchase;
  } catch (error) {
    console.error("Failed to initialize medicines collection:", error);
  }
}
await initCollection();

router.post("/", async (req, res) => {
  try {
    const order = req.body;
    const result = await purchaseCollection.insertOne(order);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const result = await purchaseCollection.find().sort({ date: -1 }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.patch("/orders/change-status/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { orderStatus } = req.body;
    const filter = { _id: new ObjectId(id) };
    const updatedOrderStatus = {
      $set: { orderStatus: orderStatus },
    };
    const result = await purchaseCollection.updateOne(
      filter,
      updatedOrderStatus
    );
    res.send({
      data: result,
      message: `Order Status Changed To ${orderStatus} Successfully`,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
