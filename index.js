import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import routes from "./routes/index.js";
import { connectDB } from "./config/connectDB.js";
import { cookieOptions } from "./routes/auth.js";
import logger from "./middleware/logger.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://care-matrix.web.app"
  ],
  credentials: true,
  optionalSuccessStatus: 200,
};

// Middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(logger);

// MongoDB Connection
connectDB().catch(console.error);

// Mount Router
app.use("/", routes);

// Start the server
app.listen(port, () => {
  console.log(`Care Matrix Server is running at port: ${port}`);
});
