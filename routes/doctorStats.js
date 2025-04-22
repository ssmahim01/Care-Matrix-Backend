import express from "express";
import { connectDB } from "../config/connectDB.js";
const router = express.Router();

// Initialize All COllections
let doctorCollection;
let paymentsCollection;
let appointmentsCollection;
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

async function initAppointmentsCollection() {
  try {
    const collections = await connectDB();
    appointmentsCollection = collections.appointments;
  } catch (error) {
    console.error("Failed to initialize appointments collection:", error);
  }
}
await initAppointmentsCollection();

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
          },
        },
        {
          $project: {
            date: "$_id",
            totalRevenue: "$totalAmount",
            _id: 0,
          },
        },
        {
          $sort: { date: -1 },
        },
      ])
      .toArray();

    const allAppointments = await appointmentsCollection
      .find({
        doctorId: doctorIdStr,
        status: { $in: ["Approved", "Prescribed"] },
      })
      .project({
        name: 1,
        date: 1,
        time: 1,
        consultationFee: 1,
        status: 1,
      })
      .sort({ date: -1 })
      .toArray();

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

    // total & avg revenue of doctor
    const totalRevenue = revenueAgg.reduce(
      (sum, item) => sum + item?.totalRevenue,
      0
    );
    const avgRevenuePerAppointment =
      totalRevenue / (allAppointments.length || 1);

    const response = {
      doctor: doctorInfo,
      stats: {
        totalRevenue: totalRevenue || 0,
        totalAppointments: allAppointments.length || 0,
        totalPrescriptions: allPrescriptions.length || 0,
        totalTreatedPatients: doctor.treated_patients || 0,
        averageRating: doctor.rating || 0,
        totalVote: doctor.vote || 0,
        avgRevenuePerAppointment: parseFloat(
          avgRevenuePerAppointment.toFixed(2)
        ),
        uniquePatientsTreated:
          new Set(allAppointments.map((appointment) => appointment.patientId))
            .size || 0,
      },
      appointments: allAppointments || [],
      prescriptions: allPrescriptions || [],
      revenueByDates: revenueAgg || [],
      appointmentsPerDay: allAppointments.reduce((acc, appointment) => {
        const date = new Date(appointment.date).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = 0;
        acc[date]++;
        return acc;
      }, {}) || {},
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching doctor overview:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
