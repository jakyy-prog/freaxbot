const Database = require("better-sqlite3");
const db = new Database("database/lobby.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS lobbies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    password TEXT,
    game TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
