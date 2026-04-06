import { db } from "../database/memStore.js";

export async function getProfile(userId) {
  try {
    // If using memStore, we use selectProfile, if using pg, we'd use db.query here
    if (db.selectProfile) {
      return await db.selectProfile(userId);
    }
    // Fallback for pg when database is active
    const res = await db.query("SELECT * FROM user_profiles WHERE user_id = $1", [userId]);
    return res.rows[0] || null;
  } catch (err) {
    console.error("Profile fetch error:", err);
    throw err;
  }
}

export async function upsertProfile(userId, profileData) {
  try {
    const { height_cm, weight_kg, age, gender } = profileData;
    if (db.upsertProfile) {
      return await db.upsertProfile(userId, { height_cm, weight_kg, age, gender });
    }
    // Fallback for pg
    const query = `
      INSERT INTO user_profiles (user_id, height_cm, weight_kg, age, gender)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const res = await db.query(query, [userId, height_cm, weight_kg, age, gender]);
    return res.rows[0];
  } catch (err) {
    console.error("Profile upsert error:", err);
    throw err;
  }
}
