const { REdoClient } = require("./client");
require("dotenv").config();

const client = new REdoClient();
client.login(process.env.DISCORD_BOT_TOKEN);

//index.js asli yang dibackup.
