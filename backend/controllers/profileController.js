import { getProfile, upsertProfile } from "../models/profileModel.js";

// GET /api/profile/:userId
export async function fetchProfile(req, res) {
  try {
    const userId = Number(req.params.userId);
    const profile = await getProfile(userId);
    return res.json({ profile });
  } catch (err) {
    console.error("fetchProfile error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
}

// POST /api/profile
export async function updateProfile(req, res) {
  try {
    const { user_id, height_cm, weight_kg, age, gender } = req.body;
    if (!user_id || !height_cm || !weight_kg) {
      return res.status(400).json({ error: "Missing required profile fields" });
    }

    const updated = await upsertProfile(user_id, {
      height_cm: Number(height_cm),
      weight_kg: Number(weight_kg),
      age: age ? Number(age) : null,
      gender: gender || null,
    });

    return res.json({ message: "Profile updated successfully", profile: updated });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
