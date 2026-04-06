import { Router } from "express";
import { logHabit, getHabits, getWeekly } from "../controllers/habitController.js";

const router = Router();

router.post("/",              logHabit);   // POST /api/habits
router.get("/:userId",        getHabits);  // GET  /api/habits/:userId
router.get("/:userId/weekly", getWeekly);  // GET  /api/habits/:userId/weekly

export default router;
