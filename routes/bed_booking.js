import express from "express";
import {
    connectDB
} from "../config/connectDB.js";
import { ObjectId } from "mongodb";

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

// update bed status
router.patch("/status/:id", async (req, res) => {
    const id = req.params.id
    const {
        status
    } = req.body
    // console.log(status, id);
    const filter = {
        _id: new ObjectId(id)
    }
    const updatedDoc = {
        $set: {
            status: status
        }
    }
    // console.log(status);
    const result = await bed_bookingCollection.updateOne(filter, updatedDoc)
    res.send(result)
});

router.post("/", async(req, res) => {
    const bedBookingInfo = await req.body;
    const result = await bed_bookingCollection.insertOne(bedBookingInfo)
    res.send(result)
})

// DELETE a bed by ID
router.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;

    const filter = {
        _id: new ObjectId(id)
    };
    const result = await bed_bookingCollection.deleteOne(filter);
    res.send(result);

});



// Api endpoint -> /appointment

export default router;