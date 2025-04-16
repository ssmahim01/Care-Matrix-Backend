import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
import { ObjectId } from "mongodb";
const router = express.Router();

let contactCollection;
async function initContactCollection() {
  try {
    await connectDB();
    contactCollection = collections.contacts;
  } catch (error) {
    console.error("Error initializing contacts collection:", error);
  }
}
initContactCollection();

router.post("/", async (req, res) => {
  try {
    const message = req.body;
    const result = await contactCollection.insertOne(message);

    res.send({
      data: result,
      message: "Contact Message Inserted In DB",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await contactCollection.find().sort({ _id: -1 }).toArray();

    const resultWithTimestamp = result.map((msg) => ({
      ...msg,
      sentAt: msg._id.getTimestamp().toISOString(),
    }));
    res.send(resultWithTimestamp);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await contactCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
