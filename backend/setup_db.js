import pool from "./database/db.js";

const schema = `
CREATE TABLE IF NOT EXISTS chat_messages (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
`;

async function setup() {
  try {
    console.log("⏳ Creating chat_messages table...");
    await pool.query(schema);
    console.log("✅ chat_messages table created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating table:", err);
    process.exit(1);
  }
}

setup();
