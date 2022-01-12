const { SlashCommandBuilder } = require("@discordjs/builders");
const { execute } = require("./get");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc-sync")
    .setDescription("Sync currencies mock file with coin gecko"),
  async execute(interaction) {
    interaction.reply();
  },
};
