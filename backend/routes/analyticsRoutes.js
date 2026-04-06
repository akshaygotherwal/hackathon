import { Router } from "express";
import { weeklyAnalytics } from "../controllers/analyticsController.js";

const router = Router();

router.get("/:userId/weekly", weeklyAnalytics); // GET /api/analytics/:userId/weekly

export default router;
