import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  register,
  login,
  profile,
  sendOTP,
  verifyOTP,
  resetPassword,
} from "../controllers/authController.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
export default router;