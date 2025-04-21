import getChatCollection from "../collections/messagesCollection";
import express from "express";
const router = express.Router();

// Send a message
router.post("/messages/send", async (req, res) => {
    const { senderId, receiverId, message, senderRole, receiverRole } = req.body;
    const messagesCollection = await getChatCollection();

    // Validate required fields
    if (!senderId || !receiverId || !message || !senderRole || !receiverRole) {
      return res.status(400).send({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Insert the message into the messages collection
    const newMessage = {
      senderId,
      receiverId,
      message,
      senderRole,
      receiverRole,
      timestamp: new Date(),
    };

    await messagesCollection.insertOne(newMessage);

    res.status(201).send({
      status: "success",
      data: newMessage,
    });
});