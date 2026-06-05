const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "freaxbot.db"));

const questDb = {
  mhp3rd: new Database(path.join(__dirname, "../quest-data/mhp3rd.db"), {
    readonly: true,
  }),
  mhfu: new Database(path.join(__dirname, "../quest-data/mhfu.db"), {
    readonly: true,
  }),
};

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS lobbies (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id     TEXT    NOT NULL UNIQUE,
    password    TEXT,
    objective   TEXT,
    game        TEXT    NOT NULL,
    owner_id    TEXT    NOT NULL,
    channel_id  TEXT    NOT NULL,
    message_id  TEXT    NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    expires_at  INTEGER
  )
`,
).run();

const cols = db.prepare("PRAGMA table_info(lobbies)").all();
if (!cols.find((c) => c.name === "expires_at")) {
  db.prepare("ALTER TABLE lobbies ADD COLUMN expires_at INTEGER").run();
  console.log("[DB] Migration: kolom expires_at ditambahkan.");
}

module.exports = { db, questDb };
