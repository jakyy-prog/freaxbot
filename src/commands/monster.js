require("dotenv").config();

const { Command } = require("@sapphire/framework");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { capitalizeWords, elementEmoji } = require("../utils/format");

const API_URL = process.env.MHW_API_URL;
const CACHE_TTL = Number(process.env.CACHE_TTL) || 300000;

if (!API_URL) {
  console.error("MHW_API_URL belum di-set!");
  process.exit(1);
}

const cache = new Map();

function setCache(key, data) {
  cache.set(key, {
    data,
    expire: Date.now() + CACHE_TTL,
  });
}

function getCache(key) {
  const c = cache.get(key);
  if (!c) return null;

  if (Date.now() > c.expire) {
    cache.delete(key);
    return null;
  }

  return c.data;
}

class MonsterCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "monster",
      description: "Info monster MH",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand(
      new SlashCommandBuilder()
        .setName("monster")
        .setDescription("Cari info monster")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Nama monster")
            .setRequired(true)
            .setAutocomplete(true),
        ),
      {
        guildIds: [process.env.DISCORD_GUILD_ID],
      },
    );
  }

  async autocompleteRun(interaction) {
    const focused = interaction.options.getFocused();

    let monsters = getCache("all_monsters");

    if (!monsters) {
      const res = await fetch(`${API_URL}/monsters`);
      monsters = await res.json();
      setCache("all_monsters", monsters);
    }

    const filtered = monsters
      .filter((m) => m.name.toLowerCase().includes(focused.toLowerCase()))
      .slice(0, 25);

    await interaction.respond(
      filtered.map((m) => ({
        name: m.name,
        value: m.name,
      })),
    );
  }

  async chatInputRun(interaction) {
    await interaction.deferReply();
    await interaction.editReply("Mencari data monster...");

    const name = interaction.options.getString("name");

    const cacheKey = `monster_${name}`;
    let data = getCache(cacheKey);

    if (!data) {
      const query = encodeURIComponent(JSON.stringify({ name }));

      const res = await fetch(`${API_URL}/monsters?q=${query}`);
      data = await res.json();

      setCache(cacheKey, data);
    }

    if (!data.length) {
      return interaction.editReply({
        content: "Data monster tidak ditemukan",
        ephemeral: true,
      });
    }

    const monster = data[0];

    const topWeakness = monster.weaknesses
      ?.filter((w) => w.stars > 0)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 2);

    const weakness = topWeakness?.length
      ? topWeakness
          .map(
            (w) =>
              `${elementEmoji(w.element)} ${capitalizeWords(w.element)} ⭐${w.stars}`,
          )
          .join("\n")
      : "Tidak ada data";

    const embed = new EmbedBuilder()
      .setTitle(`🐉 ${capitalizeWords(monster.name)}`)
      .setDescription(monster.description || "No description")
      .addFields(
        {
          name: "Type",
          value: capitalizeWords(monster.type),
          inline: true,
        },
        {
          name: "Species",
          value: capitalizeWords(monster.species),
          inline: true,
        },
        {
          name: "Weaknesses",
          value: weakness,
        },
      )
      .setColor(0xd3d3d3);

    return interaction.editReply({
      content: null,
      embeds: [embed],
    });
  }
}

module.exports = { MonsterCommand };
