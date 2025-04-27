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
      const filter = { _id: new ObjectId(id) };
      const result = await bedsCollection.deleteOne(filter);
      res.send({
        data: result,
        message: "Beds Deleted Successfully!",
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });


export default router;