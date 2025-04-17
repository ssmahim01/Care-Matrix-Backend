
import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";


const router = express.Router();

// Initialize usersCollection
let ambulanceCollection;
async function initCollection() {
    const collections = await connectDB();
    ambulanceCollection = collections.ambulance;
}
await initCollection();


router.post("/add", async (req, res) => {
    try {
        const ambulance = req.body;
        const result = await ambulanceCollection.insertOne({...ambulance});
        res.status(201).send({
            message: "Ambulance added successfully",
            ambulance,
            result
        });
    } catch (error) {
        res.status(500).send({
            error: "Failed to add ambulance. Please try again later."
        });
    }
})

router.get("/all", async (req, res)=> {
   const results = await ambulanceCollection.find().toArray();
   res.send(results)  
})

router.delete("/delete-ambulance/:id", async (req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};

    if(!id) return res.send({message: "Id is required"})

    const result = await ambulanceCollection.deleteOne(query)

    if (result.deletedCount === 1) {
        res.send({message: "Successfully deleted."});
      } else {
        res.send({message: "No id matched the query."});
      }
})

// ADMIN ONLY -> Get emergency text --->
router.get("/", async (req, res) => {
    res.send("emergency ambulance starting endpoint");
}); // Api endpoint -> /emergency


export default router;