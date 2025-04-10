import { collections, connectDB } from "../config/connectDB.js";

let usersCollection;

// Initialize Database Connection and Collections
async function initializeMongoDBCollection() {
    try {
        await connectDB();
        if (!collections.users) {
            console.error("Users collection not found in collections object");
        }
        usersCollection = collections.users;
        console.log("Users collection initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

// Export a function to get the collection, ensuring initialization
export default async function getUsersCollection() {
    if (!usersCollection) {
        await initializeMongoDBCollection();
    }
    return usersCollection;
}