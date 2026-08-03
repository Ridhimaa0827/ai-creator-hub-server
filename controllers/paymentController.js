import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 49900, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const body =
      razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
    await User.findByIdAndUpdate(req.user.userId, {
      plan: "Pro",
      credits: 999999,
    });
    res.json({
      success: true,
      message: "Payment successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};