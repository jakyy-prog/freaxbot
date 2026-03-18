const { Command } = require("@sapphire/framework");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

class FullQuestCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "fullquest",
      description: "Menampilkan semua quest Monster Hunter berdasarkan stars.",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName("fullquest")
        .setDescription(
          "Menampilkan semua quest Monster Hunter berdasarkan stars.",
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
            .setDescription("Pilih bintang quest (1-11)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(11),
        ),
    );
  }

  buildEmbed(data, page, totalPages, game, type, stars) {
    const gameNames = {
      mhp3rd: "Monster Hunter Portable 3rd",
      mhfu: "Monster Hunter Freedom Unite",
    };
    const gameName = gameNames[game] || game.toUpperCase();
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    const perPage = 10;
    const start = page * perPage;
    const quests = data.slice(start, start + perPage);

    const questList = quests
      .map((q) => {
        const typeTag =
          q.type === "Key Quest"
            ? "**(Key-Quest)**"
            : q.type === "Urgent Quest"
              ? "**(!Urgent!)**"
              : "**(Optional)**";
        const req = q.requirements
          ? `\n **(Requirements)** *${q.requirements}*`
          : "";
        return `${typeTag} ${q.quest_name}\n**Objective: ** ${q.objective}\n**Location: ** ${q.location} (${q.time}) | **Reward: ** ${q.reward}z${req}`;
      })
      .join("\n\n");

    return new EmbedBuilder()
      .setColor(0xe8871e)
      .setTitle(gameName)
      .setDescription(questList)
      .setFooter({
        text: `${typeName} Quest • ⭐${stars} Stars • Halaman ${page + 1}/${totalPages}`,
      })
      .setTimestamp();
  }

  buildButtons(page, totalPages) {
    const prev = new ButtonBuilder()
      .setCustomId("fullquest_prev")
      .setLabel("◀ Sebelumnya")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0);

    const next = new ButtonBuilder()
      .setCustomId("fullquest_next")
      .setLabel("Selanjutnya ▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages - 1);

    return new ActionRowBuilder().addComponents(prev, next);
  }

  async chatInputRun(interaction) {
    await interaction.deferReply();

    const game = interaction.options.getString("game");
    const type = interaction.options.getString("type");
    const stars = interaction.options.getInteger("stars");

    const maxStars = {
      mhp3rd: { village: 6, guild: 8 },
      mhfu: { village: 9, guild: 9 },
    };

    const max = maxStars[game]?.[type];
    if (max && stars > max) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("Error")
            .setDescription(
              `Quest **${type}** hanya tersedia hingga ⭐${max}.`,
            ),
        ],
      });
    }

    try {
      const res = await fetch(
        `${process.env.API_URL}/quest/${game}/${type}/stars/${stars}`,
      );
      const data = await res.json();

      if (!data.length) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle("Quest Tidak Ditemukan")
              .setDescription(`Tidak ada quest untuk **${type}** ⭐${stars}.`),
          ],
        });
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

      const message = await interaction.editReply(replyOptions);
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
        if (i.customId === "fullquest_prev") page--;
        if (i.customId === "fullquest_next") page++;

        await i.update({
          embeds: [this.buildEmbed(data, page, totalPages, game, type, stars)],
          components: [this.buildButtons(page, totalPages)],
        });
      });

      collector.on("end", async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("fullquest_prev")
            .setLabel("◀ Sebelumnya")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("fullquest_next")
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
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("Error")
            .setDescription("API quest sedang offline."),
        ],
      });
    }
  }
}

module.exports = { FullQuestCommand };
