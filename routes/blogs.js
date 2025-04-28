import express from 'express';
import { connectDB } from '../config/connectDB.js';

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




export default router;