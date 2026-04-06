import axios from "axios";

// Use Vite proxy in dev (/api → http://localhost:5000/api)
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ── Habits ──────────────────────────────────────────────────
export const logHabit     = (data)   => api.post("/habits", data);
export const fetchHabits  = (userId) => api.get(`/habits/${userId}`);
export const fetchWeekly  = (userId) => api.get(`/habits/${userId}/weekly`);

// ── Digital Twin ────────────────────────────────────────────
export const fetchTwin    = (userId) => api.get(`/twin/${userId}`);

// ── Simulation ──────────────────────────────────────────────
export const runSimulation = (data)  => api.post("/simulate", data);

// ── Analytics ───────────────────────────────────────────────
export const fetchAnalytics = (userId) => api.get(`/analytics/${userId}/weekly`);

// ── Food Tracker ────────────────────────────────────────────
export const getFoodDatabase        = ()       => api.get("/food/db");
export const addFood                = (data)   => api.post("/food/add", data);
export const getFoodLogs            = (userId) => api.get(`/food/get/${userId}`);

// ── Nutrition / Goal ────────────────────────────────────────
export const getGoalRecommendations = (currentWeight, goalWeight) =>
  api.post("/nutrition/goal", { current_weight: currentWeight, goal_weight: goalWeight });

export const getWeightPrediction = (data) => api.post("/nutrition/predict-weight", data);

// ── Profile ─────────────────────────────────────────────────
export const fetchProfile = (userId) => api.get(`/profile/${userId}`);
export const saveProfile  = (data)   => api.post("/profile", data);

export default api;
