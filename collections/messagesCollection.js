import { collections, connectDB } from "../config/connectDB.js";

let messagesCollection;

// Initialize Database Connection and Collections
async function initializeMongoDBCollection() {
    try {
        await connectDB();
        if (!collections.chat) {
            console.error("Chat collection not found in collections object");
        }
        messagesCollection = collections.chat;
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

// Export a function to get the collection, ensuring initialization
export default async function getChatCollection() {
    if (!messagesCollection) {
        await initializeMongoDBCollection();
    }
    return messagesCollection;
}