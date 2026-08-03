import express from "express";
import {
  chatWithAI,
  generateImage,
  getHistory,
  generateCode,
} from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", authMiddleware, chatWithAI);
router.post("/image", authMiddleware, generateImage);
router.get("/history", authMiddleware, getHistory);
router.post("/code", authMiddleware, generateCode);
export default router;