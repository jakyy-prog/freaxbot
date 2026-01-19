const { Command } = require("@sapphire/framework");
const { EmbedBuilder } = require("discord.js");

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

        // REQUIRED dulu
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

        // OPTIONAL terakhir
        .addStringOption((option) =>
          option
            .setName("password")
            .setDescription("Password lobby (opsional)")
            .setRequired(false),
        ),
    );
  }

  // 🔥 INI DIA
  async chatInputRun(interaction) {
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

    await interaction.reply({
      content: `@everyone ${interaction.user} lagi buka lobby nih! Gas join🔥🔥🔥`,
      embeds: [embed],
    });
  }
}

module.exports = { CreateLobbyCommand };
