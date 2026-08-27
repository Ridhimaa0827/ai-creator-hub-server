import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
export const chatWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.plan !== "Pro" && user.credits <= 0) {
      return res.status(400).json({
        success: false,
        message: "No credits left. Upgrade to Pro.",
      });
    }
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    const reply = response.data.choices[0].message.content;
    await Chat.create({
      user: req.user.userId,
      prompt,
      reply,
    });
    if (user.plan !== "Pro") {
      user.credits -= 1;
      await user.save();
    }
    res.status(200).json({
      success: true,
      reply,
      credits: user.credits,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};
export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.plan !== "Pro" && user.credits <= 0) {
      return res.status(400).json({
        success: false,
        message: "No credits left. Upgrade to Pro.",
      });
    }
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      },
    );
    const image = Buffer.from(response.data).toString("base64");
    try {
      console.log("USER:", req.user);
      console.log("PROMPT:", prompt);
      console.log("IMAGE SIZE:", image.length);
      const saved = await Chat.create({
        user: req.user.userId,
        prompt,
        type: "image",
        image: `data:image/png;base64,${image}`,
      });
      console.log("IMAGE SAVED:", saved);
    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
    if (user.plan !== "Pro") {
      user.credits -= 1;
      await user.save();
    }
    res.status(200).json({
      success: true,
      image: `data:image/png;base64,${image}`,
      credits: user.credits,
    });
  } catch (error) {
    console.log("========== CLOUDFLARE ERROR ==========");
    console.log("Status:", error.response?.status);
    console.log(
      "Data:",
      error.response?.data?.toString() || error.response?.data,
    );
    console.log("Message:", error.message);
    console.log("======================================");
    res.status(500).json({
      success: false,
      error: error.response?.data?.toString() || error.message,
    });
  }
};
export const getHistory = async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user.userId,
    }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const generateCode = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.plan !== "Pro" && user.credits <= 0) {
      return res.status(400).json({
        success: false,
        message: "No credits left",
      });
    }
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content:
              "You are an expert programmer. Return only clean code with explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    const reply = response.data.choices[0].message.content;
    if (user.plan !== "Pro") {
      user.credits -= 1;
      await user.save();
    }
    res.json({
      success: true,
      reply,
      credits: user.credits,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Code generation failed",
    });
  }
};
