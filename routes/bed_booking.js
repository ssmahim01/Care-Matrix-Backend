import express from "express";
import {
    connectDB
} from "../config/connectDB.js";
import {
    ObjectId
} from "mongodb";

const router = express.Router();

// Initialize beds booking Collection
let bed_bookingCollection;
async function initCollection() {
    const collections = await connectDB();
    bed_bookingCollection = collections.bed_booking;
}

await initCollection();
// get all bed info
router.get("/", async (req, res) => {
    try {
        const result = await bed_bookingCollection.find().sort({
            time: -1
        }).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).json({
            error: "failed to fetch bed request info."
        })
    }
});
//


// get info for specific user 

router.get("/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const query = {
            authorEmail: email
        };
        const bedBookings = await bed_bookingCollection.find(query).sort({
            time: -1
        }).toArray();
        res.send(bedBookings);
    } catch (error) {
        // console.error("Error fetching bed bookings:", error);
        res.status(500).send({
            error: "Failed to fetch bed bookings"
        });
    }
});



// update bed status
router.patch("/status/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const {
            status
        } = req.body;

        const filter = {
            _id: new ObjectId(id)
        };
        const updatedDoc = {
            $set: {
                status: status
            }
        };

        const result = await bed_bookingCollection.updateOne(filter, updatedDoc);
        res.send(result);
    } catch (error) {
        // console.error("Error updating booking status:", error);
        res.status(500).send({
            error: "Failed to update booking status"
        });
    }
});


// post bed  booking info
router.post("/", async (req, res) => {
    try {
        const bed = req.body;

        const result = await bed_bookingCollection.insertOne(bed);
        res.send(result);
    } catch (error) {
        // console.error("Error inserting bed booking:", error);
        res.status(500).send({
            error: "Failed to insert bed booking"
        });
    }
});




// DELETE a bed by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const filter = {
            _id: new ObjectId(id)
        };
        const result = await bed_bookingCollection.deleteOne(filter);
        res.send(result);
    } catch (error) {
        // console.error("Error deleting bed booking:", error);
        res.status(500).send({
            error: "Failed to delete bed booking"
        });
    }
});

// search bed bookings by bedTitle, patientName, or contactNumber
router.get("/search", async (req, res) => {
    try {
        const { bedTitle, patientName, contactNumber } = req.query;
        
        if (!bedTitle && !patientName && !contactNumber) {
            return res.status(400).json({
                error: "At least one of bedTitle, patientName, or contactNumber query parameters is required"
            });
        }

        const query = {
            $or: []
        };

        if (bedTitle) {
            query.$or.push({
                bedTitle: { $regex: bedTitle, $options: 'i' } // case-insensitive search
            });
        }

        if (patientName) {
            query.$or.push({
                patientName: { $regex: patientName, $options: 'i' } // case-insensitive search
            });
        }

        if (contactNumber) {
            query.$or.push({
                contactNumber: contactNumber // exact match for contact number
            });
        }

        const results = await bed_bookingCollection.find(query).sort({
            time: -1
        }).toArray();
        
        if (results.length === 0) {
            return res.status(404).json({
                message: "No bed bookings found with the given bed title, patient name, or contact number"
            });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: "Failed to search bed bookings: " + error.message
        });
    }
});;





export default router;