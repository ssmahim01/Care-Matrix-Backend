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
        const result = await blogCollection.find().sort({ date: -1 }).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: 'failed to fetch blog info.' });
    }
});

// get blog data using id 

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id)
        };
        const result = await blogCollection.findOne(filter);
        res.send(result);
    } catch (error) {
        res.status(500).json({ error: 'failed to fetch blog info.' });
    }
    }
);




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

// post delete info
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id)
        };
        // console.log(id);
        const result = await blogCollection.deleteOne(filter);
        res.send({
            data: result,
            message: "Blog Deleted Successfully!",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




export default router;