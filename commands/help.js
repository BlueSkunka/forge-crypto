const { SlashCommandBuilder } = require("@discordjs/builders");
const { apiToken } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc-help")
    .setDescription(
      "Display a list of available commands and bot informations"
    ),
  async execute(interaction) {
    await interaction.reply("HELP ME");
  },
};
