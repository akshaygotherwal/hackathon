import { Router } from "express";
import { handleChatMessage, getHistory } from "../controllers/chatController.js";

const router = Router();

router.post("/", handleChatMessage); // POST /api/chat
router.get("/history", getHistory);  // GET  /api/chat/history

export default router;
