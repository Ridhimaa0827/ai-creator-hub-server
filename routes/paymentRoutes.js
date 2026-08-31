import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createCheckoutSession,
  verifyStripePayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/create-checkout-session",
  authMiddleware,
  createCheckoutSession
);

router.post(
  "/verify-payment",
  authMiddleware,
  verifyStripePayment
);

export default router;