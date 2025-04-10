import getUsersCollection from "../collections/usersCollection";
import { collections, connectDB } from "../config/connectDB";

let rewardsCollection;
// Initialize Database Connection and Collections
async function mongoDBCollection() {
    try {
        await connectDB();
        rewardsCollection = collections.rewards;
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

// Ensure the database is initialized before handling routes
mongoDBCollection();

// Get patient’s points and reward history
router.get("/:userId", async (req, res) => {
    const usersCollection = await getUsersCollection();
    const { userId } = req.params;
    const user = await usersCollection.findOne({ uid: userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const history = await rewardsCollection.find({ userId }).toArray();
    const totalPoints = history.reduce((sum, entry) => sum + entry.points, 0);
    res.json({ success: true, totalPoints, history });
}); // API endpoint -> /rewards/:userId