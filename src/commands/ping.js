const { Command } = require("@sapphire/framework");

class Pingcommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: "ping",
            description: "Replies with Pong!",
        });
    }

    async chatInputRun(interaction) {
        const ping = interaction.client.ws.ping;

        await interaction.reply({
            content: `🏓 Pong! Latency is ${ping}ms`,
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
        );
    }
}

module.exports = { Pingcommand };