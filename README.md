<div align="center">
  <img src="/public/care-matrix-ui.png" alt="Care Matrix UI" width="100%" height="370"/>
  <h1>🏥 Care Matrix Backend</h1>
  <p>API Server for the Care Matrix Hospital Management System</p>

  <p>
    <a href="https://care-matrix.web.app" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Demo-Care%20Matrix-brightgreen" alt="Live Demo"/>
    </a>
    <a href="https://github.com/ssmahim01/Care-Matrix-With-Dev-Sync" target="_blank">
      <img src="https://img.shields.io/badge/Frontend%20Repository-Click%20Here-blue" alt="Frontend Repository"/>
    </a>
  </p>
</div>

---

## 📖 Overview

**Care Matrix Backend** powers the Care Matrix hospital management system, a robust platform designed to digitize and streamline hospital operations, enhance patient care, and improve operational efficiency. This backend provides secure APIs for managing medical records, real-time communication, billing, inventory, and more, ensuring seamless coordination among medical professionals, administrators, receptionists, pharmacists, and patients.

---

## 🛠️ Technologies Used

### Core Stack
- **Node.js** - JavaScript runtime for building scalable server-side applications
- **Express.js** - Web framework for Node.js to handle routing and middleware
- **MongoDB** - NoSQL database for storing medical records, user data, and transactions

### Security & Authentication
- **Firebase Admin SDK** - Server-side authentication and user management
- **JSON Web Tokens (JWT)** - Secure token-based authentication
- **bcrypt** - Password hashing for secure storage

### Additional Tools
- **Stripe** - Payment processing for billing and transactions
- **CORS** - Cross-Origin Resource Sharing for secure API access
- **Dotenv** - Environment variable management
- **Vercel** - Backend hosting and deployment

---

## 🚀 Core Features

The backend supports the following features through its API endpoints:

- **Medical Records Management**  
  Securely stores and retrieves patient data, prescriptions, and medical history.

- **Real-Time Chat**  
  Manages real-time communication between users (patients, doctors, pharmacists) with message storage and retrieval.

- **Billing & Payment Processing**  
  Integrates with Stripe to handle online payments and updates billing statuses.

- **Real-Time Bed Availability**  
  Tracks and updates hospital bed occupancy in real-time for efficient allocation.

- **Pharmacy & Inventory Management**  
  Manages medicine stock, tracks inventory levels, and sends restocking alerts.

- **Emergency Services Coordination**  
  Handles emergency contact retrieval, ambulance booking, and urgent care scheduling.

- **Doctors Management**  
  Provides endpoints for managing doctors’ schedules and availability.

- **Patient Health Rewards System**  
  Tracks patient activities (check-ups, medication adherence) and manages rewards.

- **Medicine Cart & Checkout**  
  Manages cart operations, calculates costs, and processes medicine purchases.

- **Purchase History Tracking**  
  Stores and retrieves purchase history for patients, including invoice generation.

---

## 📦 Dependencies

Key dependencies used in the backend:

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

Follow these steps to set up the backend locally:

### 1. Clone the Repository
```bash
git clone https://github.com/ssmahim01/Care-Matrix-Backend.git
cd Care-Matrix-Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the required environment variables. Example:

```env
# MongoDB Connection
DB_URI=your-mongodb-uri

# JWT Secret for Authentication
JWT_SECRET=your-jwt-secret-token

# Stripe Secret Key for Payments
STRIPE_SECRET_KEY=your-stripe-secret-key

# Firebase Admin SDK Configuration
TYPE=your-service_account
PROJECT_ID=your-project-id
PRIVATE_KEY_ID=your-private-key-id
PRIVATE_KEY="your-private-key"
CLIENT_EMAIL=your-client-email
CLIENT_ID=your-client-id
AUTH_URI=https://accounts.google.com/o/oauth2/auth
TOKEN_URI=https://oauth2.googleapis.com/token
AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-client-email
UNIVERSE_DOMAIN=googleapis.com
```

---

## 🏃 Running the Backend Locally

To start the backend server:

```bash
npm start
```

- The server will run at:  
  🌐 **`http://localhost:3000`**

For frontend setup instructions, visit the [Frontend Repository](https://github.com/ssmahim01/Care-Matrix-With-Dev-Sync).

---

## 🧪 Testing

To run tests (if applicable):

```bash
npm test
```

Currently, the project uses manual testing. Automated tests with tools like **Jest** and **Supertest** are planned for future development. Contributions to add tests are welcome!

---

## 🛠️ Development Setup

This backend is built with **Node.js** and **Express.js**, providing a fast and scalable server environment. Key features include:

- **CORS**: Enables secure cross-origin requests.
- **MongoDB**: Efficient NoSQL database for data storage.
- **JWT**: Token-based authentication for secure API access.
- **Dotenv**: Manages environment variables securely.

### Recommended Tools
- **Postman** or **Thunder Client**: For testing API endpoints.
- **MongoDB Compass**: For managing the MongoDB database locally.

---

## 🤝 Contributing

Contributions are welcome! To contribute to the Care Matrix Backend:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit (`git commit -m "Add YourFeature"`).
4. Push to your branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

Please ensure your code follows the project’s coding standards, includes appropriate tests, and adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org).

---

## 🙌 Acknowledgments

- Thanks to the open-source community for providing the technologies that made this project possible.
- Special thanks to the contributors of **DevSync Hub** for their support and collaboration.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Care-Matrix-Backend" target="_blank">Team DevSync Hub</a></p>
</div>