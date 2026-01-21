const { Command } = require("@sapphire/framework");
const { EmbedBuilder } = require("discord.js");
const db = require("../../database/db");

class CloseLobbyCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "closelobby",
      description: "Menutup lobby Monster Hunter",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  async chatInputRun(interaction) {
    const lobby = db
      .prepare(`SELECT * FROM lobbies WHERE owner_id = ? AND channel_id = ?`)
      .get(interaction.user.id, interaction.channelId);

    if (!lobby) {
      return interaction.reply({
        content: "❌ Kamu tidak punya lobby aktif di channel ini.",
        ephemeral: true,
      });
    }

    try {
      const channel = await interaction.client.channels.fetch(lobby.channel_id);
      const message = await channel.messages.fetch(lobby.message_id);
      await message.delete();
    } catch (err) {}

    db.prepare(`DELETE FROM lobbies WHERE id = ?`).run(lobby.id);

    return interaction.reply({
      content: `✅ Lobby ${interaction.user} telah ditutup.`,
    });
  }
}

module.exports = { CloseLobbyCommand };
