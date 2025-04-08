import express from "express";
import {
    connectDB
} from "../config/connectDB.js";

const router = express.Router();

// Initialize bedsCollection
let bed_bookingCollection;
async function initCollection() {
    const collections = await connectDB();
    bed_bookingCollection = collections.bed_booking;
}

await initCollection();

router.get("/", async(req, res) => {
    const bedBookings = await bed_bookingCollection.find().toArray();
    res.send(bedBookings);
})

router.post("/", async(req, res) => {
    const bedBookingInfo = await req.body;
    const result = await bed_bookingCollection.insertOne(bedBookingInfo)
    res.send(result)
})



// Api endpoint -> /appointment

export default router;