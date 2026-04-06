import express  from "express";
import cors     from "cors";
import dotenv   from "dotenv";

dotenv.config();

import habitRoutes     from "./routes/habitRoutes.js";
import twinRoutes      from "./routes/twinRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import profileRoutes   from "./routes/profileRoutes.js";

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use("/api/habits",    habitRoutes);
app.use("/api/twin",      twinRoutes);
app.use("/api/simulate",  simulationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile",   profileRoutes);

// ── Health check ───────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Digital Twin API running on http://localhost:${PORT}`);
});