const { Command } = require("@sapphire/framework");
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ThumbnailBuilder,
} = require("discord.js");

function formatDuration(ms) {
  const totalDays = Math.floor(ms / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;

  const parts = [];
  if (years > 0) parts.push(`${years} tahun`);
  if (months > 0) parts.push(`${months} bulan`);
  if (days > 0) parts.push(`${days} hari`);

  return parts.length > 0 ? parts.join(", ") : "Hari ini";
}

class UserInfoCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "userinfo",
      description: "Melihat informasi tentang user atau member server",
    });
  }

  async chatInputRun(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    const member = interaction.guild
      ? await interaction.guild.members.fetch(user.id).catch(() => null)
      : null;

    const container = new ContainerBuilder()
      .setAccentColor(member ? member.displayColor : 0xffffff)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# Informasi | ${user.username}`),
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `User ID:\n\`\`\`${user.id}\`\`\`\nAkun dibuat pada:\n<t:${Math.floor(user.createdTimestamp / 1000)}:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
            ),
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(
              user.displayAvatarURL({ size: 1024 }),
            ),
          ),
      );

    if (member) {
      container
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## Informasi Member\nMember Bergabung Pada:\n<t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)\nSudah bergabung selama: **${formatDuration(Date.now() - member.joinedTimestamp)}**\n## Roles\n${
              member.roles.cache
                .filter((role) => role.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map((role) => role.toString())
                .join(", ") || "None"
            }`,
          ),
        );
    }

    return interaction.reply({
      components: [container],
      flags: ["Ephemeral", "IsComponentsV2"],
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("informasi User mana yang ingin dilihat")
            .setRequired(false),
        ),
    );
  }
}

module.exports = {
  UserInfoCommand,
};
