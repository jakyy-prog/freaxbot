const { Command } = require("@sapphire/framework");
const { SlashCommandBuilder } = require("discord.js");

class QuestCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "quests",
      description: "Memperlihatkan quest list berdasarkan rank.",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName("quests")
        .setDescription("Memperlihatkan quest list berdasarkan rank.")
        .addStringOption((option) =>
          option
            .setName("rank")
            .setDescription("Quest Rank")
            .setRequired(true)
            .addChoices(
              { name: "HR1", value: "HR1" },
              { name: "HR2", value: "HR2" },
            ),
        ),
    );
  }

  async chatInputRun(interaction) {
    const rank = interaction.options.getString("rank");

    const res = await fetch(`http://localhost:3000/quest_mhp3rd/${rank}`);
    const data = await res.json();

    if (!data.length) {
      return interaction.reply("Quest tidak ditemukan.");
    }

    let text = "";

    data.forEach((q) => {
      text += `⭐ ${q.stars} - ${q.objective} (${q.location})\n`;
    });

    await interaction.reply({
      content: `**${rank} Quests**\n${text}`,
    });
  }
}

module.exports = {
  QuestCommand,
};
