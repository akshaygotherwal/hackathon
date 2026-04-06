import express from "express";
import cors from "cors";

import habitRoutes from "./routes/habitRoutes.js";
import twinRoutes from "./routes/twinRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/habits", habitRoutes);
app.use("/api/twin", twinRoutes);
app.use("/api/simulate", simulationRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});