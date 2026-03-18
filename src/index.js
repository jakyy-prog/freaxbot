const { REdoClient } = require("./client");
require("dotenv").config();

const client = new REdoClient();
client.login(process.env.DISCORD_BOT_TOKEN);

const { version, changelog } = require("./version");
const { EmbedBuilder } = require("discord.js");

client.once("clientReady", async () => {
  const channel = await client.channels.fetch(process.env.UPDATE_CHANNEL_ID);
  if (channel) {
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("🟢 FreaxBot Online")
          .setDescription(
            "FreaxBot telah berhasil di-deploy dan siap digunakan!",
          )
          .addFields(
            { name: "Versi", value: `${version}` },
            {
              name: "Changelog",
              value: changelog.map((c) => `• ${c}`).join("\n"),
            },
          )
          .setTimestamp(),
      ],
    });
  }
});
