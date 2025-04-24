import getChatCollection from "../collections/messagesCollection.js";
import express from "express";
import getUsersCollection from "../collections/usersCollection.js";
const router = express.Router();

// Helper function to validate email existence in users collection
const validateEmail = async (email) => {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email });
  return user !== null;
};

// Chat routes
router.post("/messages/send", async (req, res) => {
  const { senderEmail, receiverEmail, message, senderRole, receiverRole, photo } =
    req.body;
  const messagesCollection = await getChatCollection();

  if (!senderEmail || !receiverEmail || (!message && !photo) || !senderRole || !receiverRole) {
    return res.status(400).send({
      status: "error",
      message: "Missing required fields",
    });
  }

  const senderExists = await validateEmail(senderEmail);
  const receiverExists = await validateEmail(receiverEmail);
  if (!senderExists || !receiverExists) {
    return res.status(404).send({
      status: "error",
      message: "Sender or receiver email not found in users collection",
    });
  }

  // Upload image to ImgBB if provided
  let image = null;
  if (photo) {
    image = photo;
  }

  const participants = [senderEmail, receiverEmail].sort();

  const newMessage = {
    senderEmail,
    receiverEmail,
    message: message || "",
    image,
    senderRole,
    receiverRole,
    timestamp: new Date(),
  };

  const conversation = await messagesCollection.findOne({
    participants: { $all: participants },
  });

  if (conversation) {
    await messagesCollection.updateOne(
      { _id: conversation._id },
      { $push: { messages: newMessage } }
    );
  } else {
    await messagesCollection.insertOne({
      participants,
      messages: [newMessage],
    });
  }

  res.status(201).send({
    status: "success",
    data: newMessage,
  })
});

router.get("/messages/:senderEmail/:receiverEmail", async (req, res) => {
  const { senderEmail, receiverEmail } = req.params;
  const messagesCollection = await getChatCollection();

  // Validate that both sender and receiver emails exist in the users collection
  const senderExists = await validateEmail(senderEmail);
  const receiverExists = await validateEmail(receiverEmail);
  if (!senderExists || !receiverExists) {
    return res.status(404).send({
      status: "error",
      message: "Sender or receiver email not found in users collection",
    });
  }

  // Sort participants to match the stored document
  const participants = [senderEmail, receiverEmail].sort();

  // Find the conversation document
  const conversation = await messagesCollection.findOne({
    participants: { $all: participants },
  });

  if (!conversation) {
    return res.status(200).send({
      status: "success",
      data: { messages: [] },
    });
  }

  res.status(200).send({
    status: "success",
    data: conversation,
  });
});

router.get("/messages/chats/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  const messagesCollection = await getChatCollection();
  const user = await getUsersCollection();

  // Validate that the user email exists in the users collection
  const userExists = await validateEmail(userEmail);
  if (!userExists) {
    return res.status(404).send({
      status: "error",
      message: "User email not found in users collection",
    });
  }

  // Find all conversations where the user is a participant
  const conversations = await messagesCollection
    .find({
      participants: userEmail,
    })
    .toArray();

  // Extract unique chat partners
  const chatPartners = new Set();
  conversations.forEach((con) => {
    const otherParticipant = con.participants.find((email) => email !== userEmail);
    if (otherParticipant) {
      chatPartners.add(otherParticipant);
    }
  });

  // Fetch user details for each chat partner using their email
  const partners = await user
    .find({ email: { $in: Array.from(chatPartners) } })
    .toArray();

  res.status(200).send({
    status: "success",
    data: partners,
  });
});

router.get("/professionals", async (req, res) => {
  const user = await getUsersCollection();
  const doctors = await user.find({ role: { $in: ["doctor", "pharmacist"] } }).sort({ lastLoginAt: -1 }).toArray();
  res.send({
    status: "success",
    data: doctors
  })
});

router.get("/patients", async (req, res) => {
  const user = await getUsersCollection();
  const patients = await user.find({ role: "patient" }).sort({ lastLoginAt: -1 }).toArray();
  res.send({
    status: "success",
    data: patients
  })
});

export default router;