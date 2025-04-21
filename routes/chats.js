import getChatCollection from "../collections/messagesCollection.js";
import express from "express";
import getUsersCollection from "../collections/usersCollection.js";
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

// Get list of users the current user has chatted with
router.get("/messages/chats/:userId", async (req, res) => {
  const userId = req.params.userId;
  const messagesCollection = await getChatCollection();
  const usersCollection = await getUsersCollection();

  // Find all messages where the user is either the sender or receiver
  const messages = await messagesCollection.find({
    $or: [
      { senderId: userId },
      { receiverId: userId }
    ]
  }).toArray();

  // Extract unique chat partners
  const chatPartners = new Set();
  messages.forEach((msg) => {
    if (msg.senderId === userId) {
      chatPartners.add(msg.receiverId)
    } else {
      chatPartners.add(msg.senderId)
    }
  });

  // Fetch user details for each chat partner
  const partners = await usersCollection.find({
    _id: { $in: Array.from(chatPartners) }
  }).toArray();

  res.status(200).send({ status: "success", data: partners })
});

export default router;