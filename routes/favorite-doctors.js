import express from "express";
import { connectDB } from "../config/connectDB.js";
const router = express.Router();



let favoriteDoctorsCollection;
async function initCollection() {
    try {
        const collection = await connectDB()
        favoriteDoctorsCollection = collection.favorite_doctors
    } catch (error) {
        console.error("Failed to initialize carts collection:", error);
    }

}
await initCollection()

// Post favorite doctor 
router.post('/', async(req, res) => {
    const info = req.body;
    console.log(info);
    const result = await favoriteDoctorsCollection.insertOne(info)
    res.send(result)
})

export default router 