// carts related APIs

import express from "express";
import { connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();


let cartCollection
async function initCollection() {
    try {
        const collection = await connectDB()
        cartCollection = collection.carts
    } catch (error) {
        console.error("Failed to initialize carts collection:", error);
    }

}
await initCollection()


router.post('/', async (req, res) => {
    const cart = req.body
    // console.log(cart);
    if (!cartCollection) {
        return res.status(500).json({ error: "Database not connected yet!" });
    }

    // Check if already exist
    const existingItem = await cartCollection.findOne({
        medicineId: cart.medicineId,
        "customer.customerEmail": cart.customer.customerEmail
    });

    if (existingItem) {
        return res.status(400).json({
            error: "Item already exists in cart",
            existingItem: {
                _id: existingItem._id,
                medicineName: existingItem.medicineName,
                quantity: existingItem.quantity
            }
        });
    }
    const result = await cartCollection.insertOne(cart)
    res.send(result)

})

// get medicine from cart for per user
router.get("/", async (req, res) => {
    // console.log(req.query);
    const result = await cartCollection
        .find({ "customer.customerEmail": req.query.email })
        .toArray();
    res.send(result);
});

router.patch('/quantity/:id', async (req, res) => {
    const id = req.params.id
    const { quantity } = req.body;
    console.log(quantity);
    const result = await cartCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { quantity } }
    );
    res.send(result);
})


// delete single cart
router.delete("/delete/:id", async (req, res) => {
    const result = cartCollection.deleteOne({
        _id: new ObjectId(req.params.id),
    });
    res.send(result);
});

// clear cart
router.delete("/clear/:email", async (req, res) => {
    const result = await cartCollection.deleteMany({
        "customer.customerEmail": req.params.email,
    })
    res.send(result)
});


export default router 