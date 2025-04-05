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

// Get favorite doctors 
router.get('/:email', async (req, res) => {
    const email = req.params.email;
    const query = {email: email}
    const result = await favoriteDoctorsCollection.find(query).toArray()
    res.send(result)
})

// Post favorite doctor 
router.post('/', async (req, res) => {
    const info = req.body;
    console.log(info);
    const result = await favoriteDoctorsCollection.insertOne(info)
    res.send(result)
})

export default router 