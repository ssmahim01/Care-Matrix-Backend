import express from "express";
import { collections, connectDB } from "../config/connectDB.js";
const router = express.Router();

// Initialize all collections
let appointmentsCollection;
async function initAppointmentsCollection() {
  try {
    await connectDB();
    appointmentsCollection = collections.appointments;
  } catch (error) {
    console.error("Error initializing appointments collection:", error);
  }
}
initAppointmentsCollection();

let favoriteDoctorCollection;
async function initFavoriteDoctorCollection() {
  try {
    await connectDB();
    favoriteDoctorCollection = collections.favorite_doctors;
  } catch (error) {
    console.error("Error initializing favorite_doctors collection:", error);
  }
}
initFavoriteDoctorCollection();

let bedBookingCollection;
async function initBedBookingCollection() {
  try {
    await connectDB();
    bedBookingCollection = collections.bed_booking;
  } catch (error) {
    console.error("Error initializing bed_booking collection:", error);
  }
}
initBedBookingCollection();

let cartsCollection;
async function initCartsCollection() {
  try {
    await connectDB();
    cartsCollection = collections.carts;
  } catch (error) {
    console.error("Error initializing carts collection:", error);
  }
}
initCartsCollection();

let purchaseCollection;
async function initPurchaseCollection() {
  try {
    await connectDB();
    purchaseCollection = collections.purchase;
  } catch (error) {
    console.error("Error initializing purchase collection:", error);
  }
}
initPurchaseCollection();

let roleUpgradeRequestsCollections;
async function initRoleUpgradeRequests() {
  try {
    await connectDB();
    roleUpgradeRequestsCollections = collections.roleUpgradeRequests;
  } catch (error) {
    console.error("Error initializing roleUpgradeRequests collection:", error);
  }
}
initRoleUpgradeRequests();

router.get("/stats/:email", async (req, res) => {
  
});

export default router;
