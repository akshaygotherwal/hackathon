import { Router } from "express";
import { simulate } from "../controllers/simulationController.js";

const router = Router();

router.post("/", simulate); // POST /api/simulate

export default router;
