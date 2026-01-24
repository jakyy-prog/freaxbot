const { Command } = require("@sapphire/framework");
const db = require("../../database/db");

class CloseAllLobbyCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "closealllobby",
      description: "[DEV] Menutup semua lobby aktif",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  async chatInputRun(interaction) {
    const DEV_IDS = ["1434622249331327106", "685712074634166333"];

    if (!DEV_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Command ini hanya untuk developer.",
        ephemeral: true,
      });
    }

    const result = db
      .prepare(
        `
      UPDATE lobbies
      SET is_active = 0
      WHERE is_active = 1
      `,
      )
      .run();

    return interaction.reply({
      content: `${result.changes} lobby berhasil ditutup.`,
      ephemeral: true,
    });
  }
}

module.exports = { CloseAllLobbyCommand };
