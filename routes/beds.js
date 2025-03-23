import express from "express";
import {
    connectDB
} from "../config/connectDB.js";

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



// Api endpoint -> /appointment

export default router;