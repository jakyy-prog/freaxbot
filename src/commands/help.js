const { Command } = require("@sapphire/framework");

class HelpCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "help",
      description: "Melihat List Commands untuk FreaxBot",
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  async chatInputRun(interaction) {
    const helpText = `
    **FreaxBot Command List**

/ping
→ Cek ping bot

/userinfo
→ Melihat info user

/createlobby
→ Membuat lobby Monster Hunter

/closelobby
→ Menutup lobby milikmu

/listlobby
→ Melihat semua lobby yang sedang aktif

/help
→ Menampilkan daftar command ini

⚠️ Catatan:
- Satu user hanya bisa punya 1 lobby aktif
- Lobby akan otomatis ditutup setelah 6 jam
`.trim();

    return interaction.reply({
      content: helpText,
      ephemeral: true,
    });
  }
}

module.exports = { HelpCommand };
