import { Router } from "express";
import {
  getFoodDatabase,
  addFoodLog,
  getFoodLogs,
} from "../controllers/foodController.js";

const router = Router();

router.get("/db",           getFoodDatabase);   // GET  /api/food/db
router.post("/add",         addFoodLog);         // POST /api/food/add
router.get("/get/:userId",  getFoodLogs);        // GET  /api/food/get/:userId

export default router;
