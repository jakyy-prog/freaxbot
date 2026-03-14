const { Command } = require("@sapphire/framework");
const { EmbedBuilder } = require("discord.js");
const db = require("../../database/db");

class CreateLobbyCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "createlobby",
      description: "Membuat lobby Monster Hunter",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)

        .addStringOption((option) =>
          option
            .setName("room_id")
            .setDescription("ID Lobby")
            .setRequired(true),
        )

        .addStringOption((option) =>
          option
            .setName("game")
            .setDescription("Pilih seri Monster Hunter")
            .setRequired(true)
            .addChoices(
              { name: "Monster Hunter Rise", value: "rise" },
              { name: "Monster Hunter World", value: "world" },
              { name: "Monster Hunter Wilds", value: "wilds" },
            ),
        )

        .addStringOption((option) =>
          option
            .setName("password")
            .setDescription("Password lobby (opsional)")
            .setRequired(false),
        )

        .addStringOption((option) =>
          option
            .setName("objective")
            .setDescription("Objective hunting (opsional)")
            .setRequired(false),
        ),
    );
  }

  async chatInputRun(interaction) {
    const gameRoles = {
      rise: "1449983482733264978",
      world: "1449983195184500978",
      wilds: "1449983630591000616",
    };

    try {
      const userHasLobby = db
        .prepare(
          `SELECT 1 FROM lobbies 
           WHERE owner_id = ? AND is_active = 1`,
        )
        .get(interaction.user.id);

      if (userHasLobby) {
        return interaction.reply({
          content:
            "❌ Kamu masih punya lobby aktif. Tutup dulu sebelum membuat yang baru.",
          ephemeral: true,
        });
      }

      const roomId = interaction.options.getString("room_id").trim();
      const game = interaction.options.getString("game");
      const password =
        interaction.options.getString("password") ?? "Tanpa Password";
      const objective =
        interaction.options.getString("objective") ?? "Tanpa objective";

      const roomExists = db
        .prepare(
          `SELECT 1 FROM lobbies 
           WHERE room_id = ? AND is_active = 1`,
        )
        .get(roomId);

      if (roomExists) {
        return interaction.reply({
          content:
            "Kode room sudah ada, coba buka /lobbylist untuk melihat lobby yang sedang aktif.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🎮 Lobby Monster Hunter")
        .setColor(0xff6600)
        .addFields(
          { name: "Game", value: game.toUpperCase(), inline: true },
          { name: "Room ID", value: `\`${roomId}\``, inline: true },
          { name: "Password", value: `\`${password}\``, inline: true },
          { name: "Objective", value: `\`${objective}\``, inline: true },
        )
        .setFooter({
          text: `Host: ${interaction.user.username}`,
        })
        .setTimestamp();

      const roleId = gameRoles[game];
      const roleMention = roleId ? `<@&${roleId}>` : "everyone";

      const reply = await interaction.reply({
        content: `${roleMention} ${interaction.user} lagi buka lobby nih! Gas join `,
        embeds: [embed],
        fetchReply: true,
      });
      await interaction.followUp({
        content: "Lobby kamu akan otomatis ditutup dalam **6 jam**.",
        ephemeral: true,
      });

      db.prepare(
        `
        INSERT INTO lobbies 
        (room_id, password, objective, game, owner_id, channel_id, message_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      ).run(
        roomId,
        password,
        objective,
        game,
        interaction.user.id,
        interaction.channelId,
        reply.id,
      );

      setTimeout(
        () => {
          db.prepare(
            `
          UPDATE lobbies
          SET is_active = 0
          WHERE message_id = ? AND is_active = 1
          `,
          ).run(reply.id);
        },
        1000 * 60 * 60 * 6,
      );
    } catch (err) {
      console.error("CreateLobby Error:", err);

      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return interaction.reply({
          content:
            "Kode room sudah ada, coba buka /lobbylist untuk melihat lobby yang aktif.",
          ephemeral: true,
        });
      }

      return interaction.reply({
        content:
          "Terjadi kesalahan saat membuat lobby, mohon coba lagi. Atau hubungi <@1434622249331327106> untuk bantuan.",
        ephemeral: true,
      });
    }
  }
}

module.exports = { CreateLobbyCommand };
