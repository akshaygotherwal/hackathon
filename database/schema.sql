CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT
);

CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  user_id INT,
  sleep_hours FLOAT,
  water_intake FLOAT,
  steps INT,
  meal_regularity INT,
  screen_time FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);