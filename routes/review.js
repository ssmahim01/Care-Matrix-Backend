
import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";


const router = express.Router();

// Initialize usersCollection
let reviewCollection;
async function initCollection() {
    const collections = await connectDB();
    reviewCollection = collections.review;
}
await initCollection();


router.post("/add", async (req, res) => {
    try {
        const review = req.body;
        const result = await reviewCollection.insertOne({ ...review });
        res.status(201).send({
            message: "Review added successfully",
            review,
            result
        });
    } catch (error) {
        res.status(500).send({
            error: "Failed to add review. Please try again later."
        });
    }
})

router.get("/all", async (req, res) => {
    const results = await reviewCollection.find().toArray();
    res.send(results)
})

router.patch("/increase-helpful/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const query = { _id: new ObjectId(id) };

        const review = await reviewCollection.findOne(query);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.helpfulBy?.includes(userId)) {
            return res.status(400).json({ message: "You have already marked this review as helpful" });
        }

        const update = {
            $inc: { helpful: 1 },
            $push: { helpfulBy: userId }
        };

        const result = await reviewCollection.updateOne(query, update);

        res.json({ message: "Helpful count increased", result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/search", async (req, res) => {
    try {
        const search = req.query.name;

        if (!search) {
            return res.status(400).json({ message: "Search term is required" });
        }

        const query = {
            name: { $regex: search, $options: "i" }
        };

        const results = await reviewCollection.find(query).toArray();

        res.json(results);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/comment-review/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const query = { _id: new ObjectId(id) };

        const updatedDoc = {
            $push: {
                replyComments: {
                    text,
                    date: new Date(), // ✅ add time when reply is made
                },
            },
        };

        const result = await reviewCollection.updateOne(query, updatedDoc);

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Reply added successfully" });
        } else {
            res.status(404).json({ message: "Review not found or reply not added" });
        }
    } catch (error) {
        console.error("Error commenting on review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/department", async (req, res) => {
    const { department } = req.query;
  
    if (!department) {
      return res.status(400).json({ error: "Department is required" });
    }

    if(department==="all") {
        const allReview = await reviewCollection.find().toArray()
        res.send(allReview)
        return
    }
  
    const reviews = await reviewCollection
      .find({ department: department.toString().toLowerCase() })
      .toArray();
  
    res.send(reviews);
  });
  


// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("emergency ambulance starting endpoint");
}); // Api endpoint -> /emergency


export default router;