import express from "express";
import { connectDB } from "../config/connectDB.js";
const router = express.Router();

// Initialize All COllections
let doctorCollection;
let paymentsCollection;
let prescriptionsCollection;

async function initDoctorCollection() {
  try {
    const collections = await connectDB();
    doctorCollection = collections.doctors;
  } catch (error) {
    console.error("Failed to initialize doctors collection:", error);
  }
}
await initDoctorCollection();

async function initPaymentsCollection() {
  try {
    const collections = await connectDB();
    paymentsCollection = collections.payments;
  } catch (error) {
    console.error("Failed to initialize payments collection:", error);
  }
}
await initPaymentsCollection();

async function initPrescriptionsCollection() {
  try {
    const collections = await connectDB();
    prescriptionsCollection = collections.prescriptions;
  } catch (error) {
    console.error("Failed to initialize prescriptions collection:", error);
  }
}
await initPrescriptionsCollection();

router.get("/:email", async (req, res) => {
  const email = req.params.email;
  if (!email) return res.status(400).json({ message: "Email Is Required" });

  try {
    const doctor = await doctorCollection.findOne({ email: email });
    if (!doctor) return res.status(404).json({ message: "Doctor Not Found!" });
    const doctorIdStr = doctor._id.toString();

    const doctorInfo = {
      _id: doctor?._id,
      name: doctor?.name,
      title: doctor?.title,
      email: doctor?.email,
      image: doctor?.image,
      experience: doctor?.experience,
      services: doctor?.services,
      bio: doctor?.bio,
      available_days: doctor?.available_days,
      schedule: doctor?.schedule,
      shift: doctor?.shift,
      consultation_fee: doctor?.consultation_fee,
    };

    // Revenue Aggregation
    const revenueAgg = await paymentsCollection
      .aggregate([
        {
          $match: {
            "appointmentInfo.doctorId": doctorIdStr,
            paymentStatus: "succeeded",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" },
            },
            totalAmount: { $sum: { $toDouble: "$amount" } },
            transactions: {
              $push: {
                patientName: "$appointmentInfo.name",
                amount: "$amount",
                date: "$paymentDate",
                time: "$appointmentInfo.time",
                status: "$paymentStatus",
              },
            },
          },
        },
        // { $sort: { _id } },
      ])
      .toArray();

    // total revenue of doctor
    const totalRevenue = revenueAgg.reduce(
      (sum, item) => sum + item?.totalAmount,
      0
    );

    // Appointments
    const allAppointments = await paymentsCollection
      .find({
        "appointmentInfo.doctorId": doctorIdStr,
      })
      .toArray();

    //Prescriptions
    const allPrescriptions = await prescriptionsCollection
      .find({
        "patientInfo.doctorId": doctorIdStr,
      })
      .project({
        patientName: "$patientInfo.name",
        medicines: {
          $map: {
            input: "$medicines",
            as: "med",
            in: "$$med.name",
          },
        },
        medicinesCount: { $size: "$medicines" },
        date: 1,
      })
      .sort({ date: -1 })
      .toArray();

    // Build response
    const response = {
      doctorInfo,
      stats: {
        totalRevenue,
        totalAppointments: allAppointments.length,
        totalPrescriptions: allPrescriptions.length,
        totalTreatedPatients: doctor.treated_patients ?? 0,
        averageRating: doctor.rating ?? 0,
        totalVote: doctor.vote ?? 0,
      },
      appointments: allAppointments,
      prescriptions: allPrescriptions,
      revenue: {
        daily: revenueAgg.map((item) => ({
          date: item._id,
          amount: item.totalAmount,
        })),
        transactions: revenueAgg.flatMap((item) => item.transactions),
      },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching doctor overview:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
