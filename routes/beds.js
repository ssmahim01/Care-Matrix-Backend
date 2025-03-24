import express from "express";
import {
    connectDB
} from "../config/connectDB.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Initialize bedsCollection
let bedsCollection;
async function initCollection() {
    const collections = await connectDB();
    bedsCollection = collections.beds;
}
await initCollection();

router.get("/", async (req, res) => {

    const result = await bedsCollection.find().toArray();
    res.send(result);

});


router.patch("/status/:id", async (req, res) => {
    const id = req.params.id
    const { status } = req.body
    console.log(status, id);
    const filter = { _id: new ObjectId(id) }
    const updatedDoc = {
        $set: {
            status: status
        }
    }
    // console.log(status);
    const result = await bedsCollection.updateOne(filter, updatedDoc)
    res.send(result)
});



// Api endpoint -> /appointment

export default router;