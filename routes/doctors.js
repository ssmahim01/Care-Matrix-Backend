import express from "express";
import dotenv from "dotenv";
import { collections, connectDB } from "../config/connectDB";
dotenv.config();
const router = express.Router();

(async() => {
    await connectDB();
})()

router.get("/dashboard/administrator/doctors", async(req, res) => {
    if(collections?.doctors){
        return res.status(500).send({message: "Doctors are unavailable"})
    }

    const findResult = await collections.doctors.find().toArray();
    res.send(findResult);
})