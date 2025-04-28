import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";

const router = express.Router();


// initialize blog collection 
let blogCollection;
async function initCollection() {
    const collections = await connectDB();
    blogCollection = collections.blogs;
}

await initCollection();

// get all blog info
router.get('/', async (req, res) => {
    try {
        const result = await blogCollection.find().sort({ time: -1 }).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: 'failed to fetch blog info.' });
    }
});

// post blog info
router.post('/', async (req, res) => {
    try {
        const blogData = req.body;

        const result = await blogCollection.insertOne(blogData);
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




export default router;