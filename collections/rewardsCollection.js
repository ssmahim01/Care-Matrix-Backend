import { collections, connectDB } from "../config/connectDB.js";

let rewardsCollection;

// Initialize Database Connection and Collections
async function initializeMongoDBCollection() {
    try {
        await connectDB();
        if (!collections.rewards) {
            console.error("Rewards collection not found in collections object");
        }
        rewardsCollection = collections.rewards;
        console.log("Rewards collection initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

// Export a function to get the collection, ensuring initialization
export default async function getRewardsCollection() {
    if (!rewardsCollection) {
        await initializeMongoDBCollection();
    }
    return rewardsCollection;
}