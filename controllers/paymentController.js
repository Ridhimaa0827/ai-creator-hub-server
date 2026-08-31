import Stripe from "stripe";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const createCheckoutSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.plan === "Pro") {
      return res.status(400).json({
        success: false,
        message: "You are already a Pro user",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "AI Creator Hub Pro",
              description: "Upgrade to AI Creator Hub Pro",
            },
            unit_amount: 49900, // ₹499
          },
          quantity: 1,
        },
      ],

      metadata: {
        userId: user._id.toString(),
      },

      success_url:
        "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "http://localhost:5173/payment-cancel",
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create payment session",
    });
  }
};

export const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    const userId = session.metadata?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User information not found",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        plan: "Pro",
        credits: 999999,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("Stripe Verification Error:", error);

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};