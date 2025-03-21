import { collections, connectDB } from "../config/connectDB";

// Initial collection
let userCollection;

// Retrieve mongoDB collection
async function mongoDBCollection() {
    try {
        await connectDB();
        userCollection = collections.users;
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

// Ensure the database is initialized before handling routes
mongoDBCollection();

const verifyReceptionist = async(req, res, next) => {
    const email = req.decoded.email;
    const query = {email: email};
    const user = await userCollection.findOne(query);

    const isReceptionist = user?.role === "receptionist";
    if(!isReceptionist){
        return res.status(403).send({message: "Forbidden access"});
    }

    next();
  }

  export default verifyReceptionist;