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

router.get("/invoice/:invoiceId", async (req, res) => {
  try {
    const result = await purchaseCollection
      .aggregate([
        {
          // Match the document by transactionId
          $match: {
            transactionId: req.params.invoiceId,
          },
        },
        {
          // Unwind the medicines array to process each item
          $unwind: "$medicines",
        },
        {
          // Group the data back together with formatted invoice details
          $group: {
            _id: "$_id",
            transactionId: { $first: "$transactionId" },
            customerInfo: { $first: "$customerInfo" },
            totalPrice: { $first: "$totalPrice" },
            paymentStatus: { $first: "$paymentStatus" },
            orderStatus: { $first: "$orderStatus" },
            date: { $first: "$date" },
            ordered_items: {
              $push: {
                itemId: "$medicines.medicineId",
                name: "$medicines.medicineName",
                quantity: "$medicines.quantity",
                unitPrice: "$medicines.price",
                totalPrice: "$medicines.subtotal",
              },
            },
          },
        },
        {
          // Project to shape the final output
          $project: {
            _id: 1,
            transactionId: 1,
            customerInfo: 1,
            totalPrice: 1,
            paymentStatus: 1,
            orderStatus: 1,
            date: 1,
            orderedItems: "$ordered_items",
          },
        },
      ])
      .toArray();

    // Return the first result or an empty object if no match found
    res.send(result[0] || {});
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).send({ error: "Failed to generate invoice" });
  }
});

export default router;
