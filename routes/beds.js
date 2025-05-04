import express from "express";
import {
    connectDB
} from "../config/connectDB.js";
import {
    ObjectId
} from "mongodb";

const router = express.Router();

// Initialize bedsCollection
let bedsCollection;
async function initCollection() {
    const collections = await connectDB();
    bedsCollection = collections.beds;
}
await initCollection();



// get all bed info 
router.get("/", async (req, res) => {
    try {
        const result = await bedsCollection.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).json({
            error: "failed to fetch bed info."
        })
    }
});



// post bed info

router.post("/", async (req, res) => {
    try {
        const bed = req.body

        const result = await bedsCollection.insertOne(bed);
        res.send(result);
    } catch (error) {
        res.status(500).json({
            error: error.message
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

        const result = await bedsCollection.updateOne(filter, updatedDoc);
        res.send(result);
    } catch (error) {
        // console.error("Error updating status:", error);
        res.status(500).send({
            error: "Failed to update status"
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
        const result = await bedsCollection.deleteOne(filter);
        res.send({
            data: result,
            message: "Beds Deleted Successfully!",
        });
    } catch (error) {
        res.status(500).send({
            message: error.message
        });
    }
});

// update bed infi 

router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const updatedBedData = req.body

        delete updatedBedData._id;

        const filter = {
            _id: new ObjectId(id)
        }

        const updateDoc = {
            $set: updatedBedData
        }

        const options = {
            upsert: true
        }

        const result = await bedsCollection.updateOne(filter, updateDoc, options)

        if (!result) {
            return res.status(404).json({
                error: 'Blog not found.'
            });
        }

        res.send({
            result: result,
            message: "Bed Updated Successfully"
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
})

// bed search by title 
// search beds by title
router.get("/search", async (req, res) => {
    try {
        const { title } = req.query;
        
        if (!title) {
            return res.status(400).json({
                error: "Title query parameter is required"
            });
        }

        const query = {
            title: { $regex: title, $options: 'i' } // case-insensitive search
        };

        const results = await bedsCollection.find(query).toArray();
        
        if (results.length === 0) {
            return res.status(404).json({
                message: "No beds found with the given title"
            });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: "Failed to search beds: " + error.message
        });
    }
});



export default router;