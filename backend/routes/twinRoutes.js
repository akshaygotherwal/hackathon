import { Router } from "express";
import { getTwin } from "../controllers/digitalteinController.js";

const router = Router();

router.get("/:userId", getTwin); // GET /api/twin/:userId

export default router;
