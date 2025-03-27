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

    const result = await bedsCollection.find().toArray();
    res.send(result);

});

// post bed info
router.post("/", async (req, res) => {
    const bed = req.body
    const result = await bedsCollection.insertOne(bed)
    res.send(result)
});


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
    const result = await bedsCollection.updateOne(filter, updatedDoc)
    res.send(result)
});


// DELETE a bed by ID
router.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;

    const filter = {
        _id: new ObjectId(id)
    };
    const result = await bedsCollection.deleteOne(filter);
    res.send(result);

});


// Api endpoint -> /appointment

export default router;