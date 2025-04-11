import { collections, connectDB } from "../config/connectDB.js";

let redeemableRewardsCollection;

// Initialize Database Connection and Collections
async function mongoDBCollection() {
    try {
        await connectDB();
        if (!collections.redeemableRewards) {
            console.error("Redeemable rewards collection not found in collections object");
        }
        redeemableRewardsCollection = collections.redeemableRewards;
        // console.log("Redeemable rewards collection initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

// Export a function to get the collection, ensuring initialization
export default async function getRedeemableRewardsCollection() {
    if (!redeemableRewardsCollection) {
        await mongoDBCollection();
    }
    return redeemableRewardsCollection;
}