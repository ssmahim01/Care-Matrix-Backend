import getRedeemableRewardsCollection from "../collections/redeemableRewardsCollection.js";
import getRewardsCollection from "../collections/rewardsCollection.js";
import getUsersCollection from "../collections/usersCollection.js";
import express from "express";
const router = express.Router();

// Get available rewards
router.get("/available-rewards", async (req, res) => {
    const predefinedRewards = [
        { _id: "1", name: "Cafeteria Voucher", pointsRequired: 50 },
        { _id: "2", name: "Priority Appointment", pointsRequired: 100 },
        { _id: "3", name: "Wellness Kit", pointsRequired: 75 },
    ];
    res.send({ success: true, rewards: predefinedRewards });
}); // API endpoint -> /rewards/available-rewards

// Get patient’s points and reward history
router.get("/:userEmail", async (req, res) => {
    const usersCollection = await getUsersCollection();
    const rewardsCollection = await getRewardsCollection();

    const { userEmail } = req.params;
    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) return res.status(404).send({ success: false, message: "User not found" });

    const history = await rewardsCollection.find({ userEmail }).toArray();
    const totalPoints = history.reduce((sum, entry) => sum + entry.points, 0);
    res.send({ success: true, totalPoints, history });
}); // API endpoint -> /rewards/:userEmail

// Redeem a reward
router.post("/redeem-reward", async (req, res) => {
    const { userEmail, rewardId } = req.body;
    const usersCollection = await getUsersCollection();
    const rewardsCollection = await getRewardsCollection();
    const redeemableRewardsCollection = await getRedeemableRewardsCollection();

    const predefinedRewards = [
        { _id: "1", name: "Cafeteria Voucher", pointsRequired: 50 },
        { _id: "2", name: "Priority Appointment", pointsRequired: 100 },
        { _id: "3", name: "Wellness Kit", pointsRequired: 75 },
    ];

    const reward = predefinedRewards.find(r => r._id === rewardId);
    if (!reward) return res.status(404).send({ success: false, message: "Reward not found" });

    const user = await usersCollection.findOne({ email: userEmail });
    if (!user) return res.status(404).send({ success: false, message: "User not found" });

    const history = await rewardsCollection.find({ userEmail }).toArray();
    const totalPoints = history.reduce((sum, entry) => sum + entry.points, 0);

    if (totalPoints < reward.pointsRequired) {
        return res.status(400).send({ success: false, message: "Insufficient points" });
    }

    // Deduct points by adding a negative entry
    await rewardsCollection.insertOne({
        userEmail,
        action: `Redeemed ${reward.name}`,
        points: -reward.pointsRequired,
        date: new Date(),
    });

    // Simulate reward issuance (e.g., generate a voucher code)
    const voucherCode = `CARE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await redeemableRewardsCollection.updateOne(
        { _id: rewardId },
        { $push: { redemptions: { userEmail, code: voucherCode, date: new Date() } } }
    );

    res.send({ success: true, message: "Reward redeemed", voucherCode });
}); // API endpoint -> /rewards/redeem-reward

// Award points after payment
router.post("/award-points", async (req, res) => {
    const rewardInfo = req.body;
    const rewardsCollection = await getRewardsCollection();
    await rewardsCollection.insertOne(rewardInfo);
    res.send({ success: true, message: "Points awarded" });
}); // API Endpoint -> /rewards/award-points

export default router;