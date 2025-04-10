// carts related APIs

import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
import Stripe from "stripe";
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let cartCollection;
async function initCollection() {
  try {
    const collection = await connectDB();
    cartCollection = collection.carts;
  } catch (error) {
    console.error("Failed to initialize carts collection:", error);
  }
}
await initCollection();

router.post("/", async (req, res) => {
  const cart = req.body;
  // console.log(cart);
  if (!cartCollection) {
    return res.status(500).json({ error: "Database not connected yet!" });
  }

  // Check if already exist
  const existingItem = await cartCollection.findOne({
    medicineId: cart.medicineId,
    "customer.customerEmail": cart.customer.customerEmail,
  });

  if (existingItem) {
    return res.status(400).json({
      error: "Item already exists in cart",
      existingItem: {
        _id: existingItem._id,
        medicineName: existingItem.medicineName,
        quantity: existingItem.quantity,
      },
    });
  }
  const result = await cartCollection.insertOne(cart);
  res.send(result);
});

// get medicine from cart for per user
router.get("/", async (req, res) => {
  // console.log(req.query);
  const result = await cartCollection
    .find({ "customer.customerEmail": req.query.email })
    .toArray();
  res.send(result);
});

router.patch("/quantity/:id", async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;
  console.log(quantity);
  const result = await cartCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { quantity } }
  );
  res.send(result);
});

// delete single cart
router.delete("/delete/:id", async (req, res) => {
  const result = cartCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(result);
});

// clear cart
router.delete("/clear/:email", async (req, res) => {
  const result = await cartCollection.deleteMany({
    "customer.customerEmail": req.params.email,
  });
  res.send(result);
});

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { price } = req.body;
    console.log("Request body:", req.body);

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      console.log("Validation failed:", { price });
      return res.status(400).json({ error: "Invalid price amount" });
    }

    const amount = Math.round(parseFloat(price) * 100);
    console.log(`Creating payment intent: ৳${price} => ${amount} taka`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "bdt",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment intent created:", paymentIntent.id);
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment Intent Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
