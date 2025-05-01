<div align="center">
  <img src="/public/care-matrix-ui.png" alt="Care Matrix UI" width="100%" height="370"/>
  <h1>🏥 Care Matrix</h1>
  <p>A Comprehensive Hospital Management Application</p>

  <p>
    <a target="_blank" href="https://care-matrix.web.app">
      <img src="https://img.shields.io/badge/Live%20Demo-Care%20Matrix-brightgreen" alt="Live Demo"/>
    </a>
    <a target="_blank" href="https://github.com/ssmahim01/Care-Matrix-With-Dev-Sync">
      <img src="https://img.shields.io/badge/Backend%20Repository-Click%20Here-blue" alt="Frontend Repository"/>
    </a>
  </p>
</div>

---

## 📖 Overview

**Care Matrix** is a robust hospital management system designed to digitize and streamline hospital operations, enhance patient care, and improve operational efficiency. It facilitates seamless coordination among medical professionals, administrators, receptionists, pharmacists, and patients, ensuring optimal healthcare delivery through an intuitive and modern platform.

---

## 🛠️ Technologies Used

### Frontend
- **React** - JavaScript library for building user interfaces
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Daisy UI** - Tailwind CSS component library
- **Shadcn UI** - Accessible UI components
- **Stripe** - Payment integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for Node.js
- **MongoDB** - NoSQL database

### Additional Tools
- **Firebase Authentication** - Secure user authentication
- **React Router** - Client-side routing
- **Lottie React** & **Framer Motion** - Animations
- **Firebase** - Frontend hosting
- **Vercel** - Backend hosting

---

## 🚀 Core Features

- **Smart Wait-Time Prediction System**  
  Utilizes advanced algorithms to estimate real-time waiting times, improving patient experience and reducing congestion.

- **Manage Medical Records**  
  Securely stores and manages patient data, prescriptions, and medical history, accessible by both doctors and patients.

- **Chat-Activated Dashboard**  
  Enables real-time communication between users for better collaboration, including patient consultations with doctors and pharmacists.

- **Billing & Payment System**  
  Automates billing with Stripe integration for seamless online transactions, with status updates managed by receptionists.

- **Real-Time Bed Availability**  
  Tracks and manages hospital bed occupancy in real-time, allowing efficient bed allocation.

- **Pharmacy & Inventory Management**  
  Monitors medicine stock and medical supplies with restocking alerts for pharmacists.

- **Emergency Services Coordination**  
  Provides quick access to emergency contacts, ambulance booking, and urgent care scheduling.

- **Doctors Management**  
  A dashboard for administrators to manage doctors’ schedules and availability.

- **Patient Health Gamification & Rewards System**  
  Encourages healthy habits with rewards for regular check-ups and medication adherence.

- **Medicine Add To Cart & Checkout System**  
  Allows patients to browse, add medicines to their cart, and checkout with dynamic cost updates.

- **Purchase History Tracking**  
  Enables patients to view and download their medicine purchase history as PDF invoices.

---

## 📦 Dependencies

Here’s a list of key dependencies used in the project:

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "firebase-admin": "^13.2.0",
    "jsonwebtoken": "^9.0.2",
    "moment": "^2.30.1",
    "mongodb": "^6.14.2",
    "stripe": "^17.7.0"
  }
}
```
---

## 📥 Installation & Setup

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/ssmahim01/Care-Matrix-Backend.git
cd Care-Matrix-Backend
```

### 2. Install Dependencies
<p>

```bash
npm start
```
</p>

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the necessary environment variables. Example:

```env
DB_URI=Provide-mongodb-uri
JWT_SECRET=Provide-jwt-secret-token
STRIPE_SECRET_KEY=Provide-stripe-secret-key
TYPE=Provide-firebase-project-type
PROJECT_ID=Provide-project-id
PRIVATE_KEY_ID=Provide-private-key-id
PRIVATE_KEY=Provide-private-key
CLIENT_EMAIL=Provide-client-email
CLIENT_ID=Provide-client-id
AUTH_URI=Provide-auth-uri
TOKEN_URI=Provide-token-uri
AUTH_PROVIDER_X509_CERT_URL=Provide-auth-provider-x509-cert-url
CLIENT_X509_CERT_URL=Provide-client-x509-cert-url
UNIVERSE_DOMAIN=Provide-universe-domain
```

---

## 🏃 Running the Project Locally

To run the project locally:

```bash
npm start
```

- The development server will start at:  
  🌐 **`http://localhost:3000`**

For Frontend setup instructions, visit the [Frontend Repository](https://github.com/ssmahim01/Care-Matrix-With-Dev-Sync).

---

## 🛠️ Development Setup (Node.js & Express.js)

This project uses **Node.js** with **Express.js** router for a fast development experience. CORS (Cross-origin resource sharing), MongoDB, Dotenv, and JWT (JSON web token) make the server more secure and efficient. 

---

## 🤝 Contributing

Contributions are welcome! To contribute to Care Matrix:

1. Clone the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit (`git commit -m "Add YourFeature"`).
4. Push to your branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

Please ensure your code follows the project’s coding standards and includes appropriate tests.

---

## 🙌 Acknowledgments

- Thanks to the open-source community for providing the technologies that made this project possible.
- Special thanks to the contributors of DevSync Hub who helped improve the Care Matrix.

---

<div align="center">
  <p>Built by ❤️ <a target="_blank" href="https://github.com/ssmahim01/Care-Matrix-Backend">Team DevSync Hub</a></p>
</div>