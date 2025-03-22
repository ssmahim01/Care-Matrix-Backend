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

router.post("/", async(req, res) => {
    const bed_bookingInfo = await req.body;
    const result = await bed_bookingCollection.insertOne(bed_bookingInfo)
    res.send(result)
})



// Api endpoint -> /appointment

export default router;