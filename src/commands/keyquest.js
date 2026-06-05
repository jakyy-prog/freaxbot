const { Command } = require("@sapphire/framework");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const { questDb } = require("../../database/db");

class KeyQuestCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "keyquest",
      description: "Menampilkan Key Quest dan Urgent Quest berdasarkan rank.",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName("keyquest")
        .setDescription(
          "Menampilkan Key Quest dan Urgent Quest berdasarkan rank.",
        )
        .addStringOption((option) =>
          option
            .setName("game")
            .setDescription("Pilih game Monster Hunter")
            .setRequired(true)
            .addChoices(
              { name: "Monster Hunter Portable 3rd", value: "mhp3rd" },
              { name: "Monster Hunter Freedom Unite", value: "mhfu" },
            ),
        )
        .addIntegerOption((option) =>
          option
            .setName("ranks")
            .setDescription("Pilih rank (1-9, contoh: 1 = HR1)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(9),
        ),
    );
  }

  buildEmbed(data, page, totalPages, game, rank) {
    const gameNames = {
      mhp3rd: "Monster Hunter Portable 3rd",
      mhfu: "Monster Hunter Freedom Unite",
    };
    const perPage = 10;
    const quests = data.slice(page * perPage, page * perPage + perPage);

    const questList = quests
      .map((q) => {
        const typeTag =
          q.type === "Key Quest" ? "**(Key-Quest)**" : "**(!Urgent!)**";
        const req = q.requirements
          ? `\n **(Requirements)** *${q.requirements}*`
          : "";
        return `${typeTag} ${q.quest_name}\n**Objective:** ${q.objective}\n**Location:** ${q.location} (${q.time}) | **Reward:** ${q.reward}z${req}`;
      })
      .join("\n\n");

    return new EmbedBuilder()
      .setColor(0xe8871e)
      .setTitle(gameNames[game] || game.toUpperCase())
      .setDescription(questList)
      .setFooter({
        text: `Guild Quest • ${rank} • Key & Urgent • Halaman ${page + 1}/${totalPages}`,
      })
      .setTimestamp();
  }

  buildButtons(page, totalPages) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("keyquest_prev")
        .setLabel("◀ Sebelumnya")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("keyquest_next")
        .setLabel("Selanjutnya ▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === totalPages - 1),
    );
  }

  async chatInputRun(interaction) {
    await interaction.deferReply();

    const game = interaction.options.getString("game");
    const rank = `HR${interaction.options.getInteger("ranks")}`;

    try {
      const data = questDb[game]
        .prepare(
          `
        SELECT quest_name, objective, location, time, reward, type, requirements
        FROM guild
        WHERE (type = 'Key Quest' OR type = 'Urgent Quest')
          AND ranks = ?
        ORDER BY stars ASC
      `,
        )
        .all(rank);

      if (!data.length) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle("Quest Tidak Ditemukan")
              .setDescription(
                `Tidak ada Key Quest atau Urgent Quest untuk **${rank}**.`,
              ),
          ],
        });
      }

      const perPage = 10;
      const totalPages = Math.ceil(data.length / perPage);
      let page = 0;

      const message = await interaction.editReply({
        embeds: [this.buildEmbed(data, page, totalPages, game, rank)],
        components: totalPages > 1 ? [this.buildButtons(page, totalPages)] : [],
      });

      if (totalPages <= 1) return;

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "Tombol ini bukan untukmu!",
            ephemeral: true,
          });
        }
        if (i.customId === "keyquest_prev") page--;
        if (i.customId === "keyquest_next") page++;
        await i.update({
          embeds: [this.buildEmbed(data, page, totalPages, game, rank)],
          components: [this.buildButtons(page, totalPages)],
        });
      });

      collector.on("end", async () => {
        await interaction
          .editReply({
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("keyquest_prev")
                  .setLabel("◀ Sebelumnya")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId("keyquest_next")
                  .setLabel("Selanjutnya ▶")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true),
              ),
            ],
          })
          .catch(() => {});
      });
    } catch (err) {
      console.error("KeyQuest Error:", err);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("Error")
            .setDescription("Gagal membaca data quest."),
        ],
      });
    }
  }
}

module.exports = { KeyQuestCommand };
