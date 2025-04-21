import getChatCollection from "../collections/messagesCollection.js";
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

// Retrieve messages between two users
router.get("/messages/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  const messagesCollection = await getChatCollection();

  // Fetch messages where sender and receiver match either direction
  const messages = await messagesCollection.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId }
    ]
  }).sort({ timeStamp: 1 }).toArray();

  res.status(200).send({ status: "success", data: messages });
});

export default router;