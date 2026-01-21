const { REdoClient } = require("./client");
require("dotenv").config();

const client = new REdoClient();
client.login(process.env.DISCORD_BOT_TOKEN);

client.once("ready", async () => {
  await client.application.commands.set([]);
  console.log("🔥 GLOBAL COMMANDS CLEARED");
});
