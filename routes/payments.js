import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let paymentsCollection;
let doctorsCollection;

async function initCollection() {
  try {
    const dbCollections = await connectDB();
    if (!dbCollections?.payments) {
      throw new Error("Payments collection not initialized.");
    }
    paymentsCollection = dbCollections.payments;
    // console.log('Payments collection initialized successfully.');
  } catch (error) {
    console.error("Failed to initialize payments collection:", error.message);
  }
}

// Initialize collection
initCollection();

async function doctorCollection() {
  try {
    const dbCollections = await connectDB();
    if (!dbCollections?.doctors) {
      throw new Error("doctors collection not initialized.");
    }
    doctorsCollection = dbCollections.doctors;
    // console.log('Payments collection initialized successfully.');
  } catch (error) {
    console.error("Failed to initialize payments collection:", error.message);
  }
}

// Initialize collection
doctorCollection();

// Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { fee } = req.body;

        if (!fee || isNaN(parseFloat(fee))) {
            return res.status(400).json({ error: 'Invalid fee amount' });
        }

        const amount = Math.round(parseFloat(fee) * 100); // Convert to cents
        // console.log(`Creating payment intent: $${fee} => ${amount} cents`);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'bdt',
            payment_method_types: ['card'],
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Payment Intent Error:', error.message);
        res.status(500).json({ error: error.message });
    }

    const amount = Math.round(parseFloat(fee) * 100); // Convert to cents
    // console.log(`Creating payment intent: $${fee} => ${amount} cents`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Payment Intent Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Save Payment Data
router.post("/", async (req, res) => {
  // console.log('POST /payments endpoint hit');
  try {
    if (!paymentsCollection) {
      console.error("Payments collection not available");
      return res.status(500).json({ error: "Database not connected" });
    }

    const {
      appointmentInfo,
      paymentStatus,
      amount,
      paymentDate,
      transactionId,
    } = req.body;

    if (!appointmentInfo || !paymentStatus || !amount || !paymentDate) {
      return res.status(400).json({ error: "Missing payment data" });
    }

    const paymentRecord = {
      appointmentInfo,
      paymentStatus,
      amount: parseFloat(amount), // Ensure amount is a number
      paymentDate: new Date(paymentDate), // Ensure proper date object
      transactionId, // Stripe transaction ID
      createdAt: new Date(),
    };

    // console.log('Saving payment record:', paymentRecord);

    const result = await paymentsCollection.insertOne(paymentRecord);
    res.status(200).json({
      message: "Payment data saved successfully",
      paymentId: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving payment data:", error.message);
    res.status(500).json({ error: "Failed to save payment data" });
  }
});

// Get Payments Data
router.get("/", async (req, res) => {
  try {
    if (!paymentsCollection) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const payments = await paymentsCollection.find({}).toArray();

    if (payments.length === 0) {
      return res.status(404).json({ message: "No payment records found" });
    }

    res.status(200).json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error.message);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// get all payment
router.get("/all", async (req, res) => {
  const search = req.query.search;
  const filter = {};

  const limit = 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  if (search) {
    filter.$or = [
      { "appointmentInfo.name": { $regex: search, $options: "i" } },
      { "appointmentInfo.phone": { $regex: search, $options: "i" } },
    ];
  }

  try {
    const total = await paymentsCollection.countDocuments(filter);
    const result = await paymentsCollection
      .find(filter)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({
      payments: result,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total,
    });
  } catch (error) {
    console.error("Error fetching payments:", error.message);
    res.status(500).send({ error: "Failed to fetch payments" });
  }
});

// delete payment
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await paymentsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Payment deleted successfully" });
    } else {
      res.status(404).json({ message: "Payment not found" });
    }
  } catch (error) {
    console.error("Error deleting payment:", error.message);
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

// get all doctors payments
router.get("/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const doctor = await doctorsCollection.findOne({ email });

    const doctorId = doctor._id.toString();

    const query = { "appointmentInfo.doctorId": doctorId };
    const result = await paymentsCollection
      .find(query)
      .sort({ paymentDate: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
