import { Router } from "express";
import { fetchProfile, updateProfile } from "../controllers/profileController.js";

const router = Router();

router.get("/:userId", fetchProfile);
router.post("/", updateProfile);

export default router;
