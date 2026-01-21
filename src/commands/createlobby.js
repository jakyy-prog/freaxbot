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
            .setDescription("Pilih seri MH")
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
        ),
    );
  }

  async chatInputRun(interaction) {
    const existing = db
      .prepare(
        `
  SELECT 1 FROM lobbies 
  WHERE owner_id = ? AND is_active = 1
`,
      )
      .get(interaction.user.id);

    if (existing) {
      return interaction.reply({
        content:
          "❌ Kamu masih punya lobby aktif. Tutup dulu sebelum bikin yang baru.",
        ephemeral: true,
      });
    }

    const roomId = interaction.options.getString("room_id");
    const game = interaction.options.getString("game");
    const password =
      interaction.options.getString("password") ?? "Tanpa Password";

    const embed = new EmbedBuilder()
      .setTitle("🎮 Lobby Monster Hunter")
      .setColor(0xff6600)
      .addFields(
        { name: "Game", value: game.toUpperCase(), inline: true },
        { name: "Room ID", value: `\`${roomId}\``, inline: true },
        { name: "Password", value: `\`${password}\``, inline: true },
      )
      .setFooter({
        text: `Host: ${interaction.user.username}`,
      })
      .setTimestamp();

    const reply = await interaction.reply({
      content: `@everyone ${interaction.user} lagi buka lobby nih! Gas join 🔥`,
      embeds: [embed],
      fetchReply: true,
    });

    db.prepare(
      `
      INSERT INTO lobbies 
      (room_id, password, game, owner_id, channel_id, message_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(
      roomId,
      password,
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
      1000 * 60 * 60 * 7,
    );
  }
}

module.exports = { CreateLobbyCommand };
