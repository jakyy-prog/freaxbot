const { Command } = require("@sapphire/framework");
const { EmbedBuilder } = require("discord.js");
const { db } = require("../../database/db");

const GAME_LABELS = {
  rise: "Monster Hunter Rise",
  world: "Monster Hunter World",
  wilds: "Monster Hunter Wilds",
};

class ListLobbyCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "listlobby",
      description: "Menampilkan daftar lobby yang sedang aktif",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  async chatInputRun(interaction) {
    let lobbies;

    try {
      lobbies = db
        .prepare(
          `
        SELECT room_id, password, objective, game, owner_id, expires_at
        FROM lobbies
        WHERE is_active = 1
        ORDER BY created_at DESC
      `,
        )
        .all();
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ Gagal mengambil data lobby.",
        ephemeral: true,
      });
    }

    if (lobbies.length === 0) {
      return interaction.reply({
        content: "❌ Tidak ada lobby aktif saat ini.",
        ephemeral: true,
      });
    }

    // Setiap lobby jadi satu field embed, lebih rapi dari deskripsi panjang
    const fields = lobbies.flatMap((lobby, index) => {
      const gameLabel = GAME_LABELS[lobby.game] ?? lobby.game.toUpperCase();
      const expiryText = lobby.expires_at
        ? `<t:${lobby.expires_at}:R>` // Discord relative timestamp, e.g. "in 4 hours"
        : "Tidak diketahui";

      return [
        {
          name: `🟢 Lobby #${index + 1} — ${gameLabel}`,
          value: [
            `🆔 **Room ID**   : \`${lobby.room_id}\``,
            `🔐 **Password**  : ${lobby.password || "Tanpa Password"}`,
            `🎯 **Objective** : ${lobby.objective || "Tanpa Objective"}`,
            `👤 **Host**      : <@${lobby.owner_id}>`,
            `⏰ **Tutup**     : ${expiryText}`,
          ].join("\n"),
          inline: false,
        },
      ];
    });

    const embed = new EmbedBuilder()
      .setTitle("📋 Daftar Lobby Monster Hunter Aktif")
      .setColor(0x00ff99)
      .addFields(fields)
      .setFooter({ text: `${lobbies.length} lobby aktif` })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
}

module.exports = { ListLobbyCommand };
