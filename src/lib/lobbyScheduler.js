const { db } = require("../../database/db");

const CHECK_INTERVAL_MS = 60 * 1000;
function startLobbyScheduler(client) {
  checkExpiredLobbies(client);

  setInterval(() => checkExpiredLobbies(client), CHECK_INTERVAL_MS);

  console.log("[Scheduler] Lobby scheduler aktif, cek setiap 1 menit.");
}

function checkExpiredLobbies(client) {
  const now = Math.floor(Date.now() / 1000);

  const expired = db
    .prepare(
      `
    SELECT message_id, channel_id, room_id
    FROM lobbies
    WHERE is_active = 1
      AND expires_at IS NOT NULL
      AND expires_at <= ?
  `,
    )
    .all(now);

  if (expired.length === 0) return;
  const closeMany = db.transaction((rows) => {
    const stmt = db.prepare(`
      UPDATE lobbies SET is_active = 0
      WHERE message_id = ? AND is_active = 1
    `);
    for (const row of rows) stmt.run(row.message_id);
  });

  closeMany(expired);

  console.log(`[Scheduler] Auto-closed ${expired.length} expired lobby.`);

  for (const lobby of expired) {
    client.channels
      .fetch(lobby.channel_id)
      .then((channel) => {
        if (channel?.isTextBased()) {
          channel.send(
            `⏰ Lobby \`${lobby.room_id}\` telah otomatis ditutup karena sudah habis waktunya.`,
          );
        }
      })
      .catch(() => {});
  }
}

module.exports = { startLobbyScheduler };
