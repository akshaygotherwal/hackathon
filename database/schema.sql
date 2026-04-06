-- ============================================================
-- AI Digital Twin Health Platform — Database Schema
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- Daily habit logs (one entry per day per user)
CREATE TABLE IF NOT EXISTS habits (
  id               SERIAL PRIMARY KEY,
  user_id          INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sleep_hours      FLOAT       NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  water_intake     FLOAT       NOT NULL CHECK (water_intake >= 0),
  steps            INT         NOT NULL CHECK (steps >= 0),
  meal_regularity  INT         NOT NULL CHECK (meal_regularity BETWEEN 0 AND 4),
  screen_time      FLOAT       NOT NULL DEFAULT 0 CHECK (screen_time >= 0),
  exercise_minutes INT         NOT NULL DEFAULT 0 CHECK (exercise_minutes >= 0),
  created_at       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- Persisted health scores (one per habit log)
CREATE TABLE IF NOT EXISTS health_scores (
  id         SERIAL PRIMARY KEY,
  user_id    INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id   INT         NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  score      INT         NOT NULL CHECK (score BETWEEN 0 AND 100),
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_habits_user_id    ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);
CREATE INDEX IF NOT EXISTS idx_scores_user_id    ON health_scores(user_id);

-- ── Weekly Analytics View ─────────────────────────────────────
CREATE OR REPLACE VIEW weekly_habit_analytics AS
SELECT
  h.user_id,
  DATE(h.created_at)         AS day,
  ROUND(AVG(h.sleep_hours)::NUMERIC, 2)     AS avg_sleep,
  ROUND(AVG(h.water_intake)::NUMERIC, 2)    AS avg_water,
  ROUND(AVG(h.steps)::NUMERIC, 0)           AS avg_steps,
  ROUND(AVG(h.meal_regularity)::NUMERIC, 2) AS avg_meal_regularity,
  ROUND(AVG(h.screen_time)::NUMERIC, 2)     AS avg_screen_time,
  ROUND(AVG(h.exercise_minutes)::NUMERIC, 0)AS avg_exercise,
  ROUND(AVG(hs.score)::NUMERIC, 0)          AS avg_health_score
FROM habits h
JOIN health_scores hs ON hs.habit_id = h.id
WHERE h.created_at >= NOW() - INTERVAL '7 days'
GROUP BY h.user_id, DATE(h.created_at)
ORDER BY h.user_id, day;