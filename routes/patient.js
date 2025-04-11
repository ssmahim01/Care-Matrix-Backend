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
  try {
    const email = req.params.email;

    const favoriteDoctors = await favoriteDoctorCollection
      .find({ email })
      .toArray();

    const upcomingAppointments = await appointmentsCollection.countDocuments({
      email,
    });

    const totalRoleUpgradeRequests =
      await roleUpgradeRequestsCollections.countDocuments({
        userEmail: email,
      });

    const totalPurchase = await purchaseCollection.countDocuments({
      "customerInfo.email": email,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = {
      appointment: await appointmentsCollection.findOne(
        { email, status: "pending", date: { $gte: today.toISOString() } },
        { sort: { date: 1 } }
      ),
      bedBookings: await bedBookingCollection
        .find({ authorEmail: email })
        .project({
          bedTitle: 1,
          bedPrice: 1,
          admissionDate: 1,
          status: 1,
          _id: 1,
        })
        .toArray(),
      medicineCart: await cartsCollection
        .find({ "customer.customerEmail": email })
        .project({
          price: 1,
          medicineName: 1,
          quantity: 1,
          _id: 1,
        })
        .toArray(),
      purchaseHistory: await purchaseCollection
        .find({ "customerInfo.email": email })
        .project({
          _id: 1,
          totalPrice: 1,
          orderStatus: 1,
          paymentStatus: 1,
          date: 1,
          medicines: {
            $map: {
              input: "$medicines",
              as: "med",
              in: {
                name: "$$med.medicineName",
                qty: "$$med.quantity",
              },
            },
          },
        })
        .sort({ date: -1 })
        .limit(3)
        .toArray(),
    };

    result.overviewStats = {
      upcomingAppointments: upcomingAppointments,
      favoriteDoctors: favoriteDoctors.length,
      bedBookingRequests: result.bedBookings.length,
      totalRoleUpgradeRequests: totalRoleUpgradeRequests,
      itemsInCart: result.medicineCart.length,
      totalOrders: totalPurchase,
      totalSpent: result.purchaseHistory.reduce(
        (acc, order) => acc + parseFloat(order.totalPrice),
        0
      ),
    };

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
