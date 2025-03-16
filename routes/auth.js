// jwt token related CRUD

import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(cookieParser());
const router = express.Router();

// cookieOptions --->
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

// Create Jwt Token --->
router.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "14d",
  });
  res
    .cookie("token", token, cookieOptions)
    .send({ token: token, success: true });
}); 
// Api endpoint -> /auth/jwt

// Clear Jwt Token --->
router.post("/logout", (req, res) => {
  res
    .clearCookie("token", { ...cookieOptions, maxAge: 0 })
    .send({ success: true });
}); 
// Api endpoint -> /auth/logout

export default router;
