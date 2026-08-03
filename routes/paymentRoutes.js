import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { createCheckoutSession } from "../controllers/stripeController.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
export default router;