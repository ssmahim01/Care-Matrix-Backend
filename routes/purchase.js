import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

// Initialize purchaseCollection
let purchaseCollection;
async function initCollection() {
    try {
        const collections = await connectDB();
        purchaseCollection = collections.purchase;
    } catch (error) {
        console.error("Failed to initialize medicines collection:", error);
    }
}
await initCollection();


router.post('/', async(req,res)=>{
    const order = req.body
    const result = await purchaseCollection.insertOne(order)
    res.send(result)
})


export default router 