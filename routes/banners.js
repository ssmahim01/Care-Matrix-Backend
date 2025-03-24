// banners crud
import express from "express";
import { connectDB, collections } from "../config/connectDB.js";
import { ObjectId } from "mongodb";

const router = express.Router();

(async () => {
    await connectDB()
})()

router.post("/", async (req, res) => {
    try {
        const banner = req.body

        if (!collections.banners) {
            return res.status(500).json({ error: "Database not connected yet!" })
        }

        const result = await collections.banners.insertOne(banner)
        res.send(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/', async (req, res) => {
    if (!collections.banners) {
        return res.status(500).json({ error: "Banners collection is not available." });
    }

    try {
        const result = await collections.banners.find().toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching banners:", error);
        res.status(500).json({ error: error.message });
    }
});

router.patch("/status/:id", async (req, res) => {
    const id = req.params.id
    const { status } = req.body
    // console.log(status, id);
    const filter = { _id: new ObjectId(id) }
    const updatedDoc = {
        $set: {
            status: status
        }
    }
    // console.log(status);
    const result = await collections.banners.updateOne(filter, updatedDoc)
    res.send(result)
});



export default router;
