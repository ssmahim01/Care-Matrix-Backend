import dotenv from "dotenv";
import express from 'express';
import Stripe from 'stripe';
import { connectDB } from '../config/connectDB.js';
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let paymentsCollection;

async function initCollection() {
    try {
        const dbCollections = await connectDB();
        if (!dbCollections?.payments) {
            throw new Error('Payments collection not initialized.');
        }
        paymentsCollection = dbCollections.payments;
        // console.log('Payments collection initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize payments collection:', error.message);
    }
}

// Initialize collection
initCollection();

// Create Payment Intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { fee } = req.body;

        if (!fee || isNaN(parseFloat(fee))) {
            return res.status(400).json({ error: 'Invalid fee amount' });
        }

        const amount = Math.round(parseFloat(fee) * 100); // Convert to cents
        // console.log(`Creating payment intent: $${fee} => ${amount} cents`);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Payment Intent Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Save Payment Data
router.post('/', async (req, res) => {
    // console.log('POST /payments endpoint hit');
    try {
        if (!paymentsCollection) {
            console.error('Payments collection not available');
            return res.status(500).json({ error: 'Database not connected' });
        }

        const { appointmentInfo, paymentStatus, amount, paymentDate, transactionId } = req.body;

        if (!appointmentInfo || !paymentStatus || !amount || !paymentDate) {
            return res.status(400).json({ error: 'Missing payment data' });
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
        res.status(200).json({ message: 'Payment data saved successfully', paymentId: result.insertedId });
    } catch (error) {
        console.error('Error saving payment data:', error.message);
        res.status(500).json({ error: 'Failed to save payment data' });
    }
});

// Get Payments Data
router.get('/', async (req, res) => {
    try {
        if (!paymentsCollection) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const payments = await paymentsCollection.find({}).toArray();

        if (payments.length === 0) {
            return res.status(404).json({ message: 'No payment records found' });
        }

        res.status(200).json({ payments });
    } catch (error) {
        console.error('Error fetching payments:', error.message);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

export default router;