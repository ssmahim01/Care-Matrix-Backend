import getRewardsCollection from "../collections/rewardsCollection.js";
import getUsersCollection from "../collections/usersCollection.js";
import express from "express";
const router = express.Router();

// Get patient’s points and reward history
router.get("/:userId", async (req, res) => {
    const usersCollection = await getUsersCollection();
    const rewardsCollection = await getRewardsCollection();

    const { userId } = req.params;
    const user = await usersCollection.findOne({ uid: userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const history = await rewardsCollection.find({ userId }).toArray();
    const totalPoints = history.reduce((sum, entry) => sum + entry.points, 0);
    res.json({ success: true, totalPoints, history });
}); // API endpoint -> /rewards/:userId

export default router;