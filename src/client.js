const {
  SapphireClient,
  ApplicationCommandRegistries,
  RegisterBehavior,
} = require("@sapphire/framework");
const { GatewayIntentBits } = require("discord.js");

class REdoClient extends SapphireClient {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });
  }

  login(token) {
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.BulkOverwrite,
    );

    return super.login(token);
  }
}

module.exports = { REdoClient };
