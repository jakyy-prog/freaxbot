const { Command } = require("@sapphire/framework");
const { EmbedBuilder } = require("discord.js");
const db = require("../../database/db");

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
          SELECT room_id, password, objective, game, owner_id
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

    let description = "";

    lobbies.forEach((lobby, index) => {
      description +=
        `🟢 **Lobby #${index + 1}**\n` +
        `🎮 Game      : ${lobby.game.toUpperCase()}\n` +
        `🆔 Room ID   : \`${lobby.room_id}\`\n` +
        `🔐 Password  : ${lobby.password || "Tanpa Password"}\n` +
        `🔍 Objective : ${lobby.objective || "Tanpa Objective"}\n` +
        `👤 Host      : <@${lobby.owner_id}>\n\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("📋 Daftar Lobby Aktif")
      .setDescription(description)
      .setColor(0x00ff99)
      .setFooter({
        text: `Total lobby aktif: ${lobbies.length}`,
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
    });
  }
}

module.exports = { ListLobbyCommand };
