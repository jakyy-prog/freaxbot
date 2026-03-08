const { Command } = require("@sapphire/framework");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

class QuestCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "quests",
      description: "Menampilkan quest Monster Hunter.",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName("quests")
        .setDescription("Menampilkan quest Monster Hunter.")
        .addStringOption((option) =>
          option
            .setName("game")
            .setDescription("Pilih game Monster Hunter")
            .setRequired(true)
            .addChoices({
              name: "Monster Hunter Portable 3rd",
              value: "mhp3rd",
            }),
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Pilih tipe quest")
            .setRequired(true)
            .addChoices(
              { name: "Village", value: "village" },
              { name: "Guild", value: "guild" },
            ),
        )
        .addIntegerOption((option) =>
          option
            .setName("stars")
            .setDescription("Pilih bintang quest (1-8)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(8),
        ),
    );
  }

  buildEmbed(data, page, totalPages, game, type, stars) {
    const gameName =
      game === "mhp3rd" ? "Monster Hunter Portable 3rd" : game.toUpperCase();
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    const perPage = 10;
    const start = page * perPage;
    const quests = data.slice(start, start + perPage);

    const questList = quests
      .map(
        (q) =>
          `⭐ **${q.stars}** — ${q.objective}\n📍 ${q.location} (${q.time}) | 💰 ${q.reward}z`,
      )
      .join("\n\n");

    return new EmbedBuilder()
      .setColor(0xe8871e)
      .setTitle(`${gameName}`)
      .setDescription(questList)
      .setFooter({
        text: `${typeName} Quest • ⭐${stars} Stars • Halaman ${page + 1}/${totalPages}`,
      })
      .setTimestamp();
  }

  buildButtons(page, totalPages) {
    const prev = new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("◀ Sebelumnya")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0);

    const next = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Selanjutnya ▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1);

    return new ActionRowBuilder().addComponents(prev, next);
  }

  async chatInputRun(interaction) {
    const game = interaction.options.getString("game");
    const type = interaction.options.getString("type");
    const stars = interaction.options.getInteger("stars");

    try {
      const res = await fetch(
        `http://localhost:3000/quest/${game}/${type}/${stars}`,
      );
      const data = await res.json();

      if (!data.length) {
        const emptyEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("Quest Tidak Ditemukan")
          .setDescription(`Tidak ada quest untuk **${type}** ⭐${stars}.`);

        return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
      }

      const perPage = 10;
      const totalPages = Math.ceil(data.length / perPage);
      let page = 0;

      const embed = this.buildEmbed(data, page, totalPages, game, type, stars);
      const row = this.buildButtons(page, totalPages);

      const replyOptions =
        totalPages > 1
          ? { embeds: [embed], components: [row] }
          : { embeds: [embed] };

      const message = await interaction.reply(replyOptions);

      if (totalPages <= 1) return;

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "Tombol ini bukan untukmu!",
            ephemeral: true,
          });
        }

        if (i.customId === "prev") page--;
        if (i.customId === "next") page++;

        const newEmbed = this.buildEmbed(
          data,
          page,
          totalPages,
          game,
          type,
          stars,
        );
        const newRow = this.buildButtons(page, totalPages);

        await i.update({ embeds: [newEmbed], components: [newRow] });
      });

      collector.on("end", async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("◀ Sebelumnya")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Selanjutnya ▶")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        );

        await interaction
          .editReply({ components: [disabledRow] })
          .catch(() => {});
      });
    } catch (err) {
      console.error(err);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Error")
        .setDescription("API quest sedang offline.");

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}

module.exports = { QuestCommand };
