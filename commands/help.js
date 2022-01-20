const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc-help")
    .setDescription(
      "Display a list of available commands and bot informations"
    ),
  async execute(interaction) {
    let embedMessage = new MessageEmbed({
      title: "Forge | Crypto",
      color: "YELLOW",
      description: "Commands list",
      fields: [
        {
          name: "/fc-get",
          value: "Retrieve currency historical market data by currency id",
          inline: true
        },
        {
          name: "symbol",
          value: "Specify currency id - you may retrieve id with /fc-search command using symbol - eg: the-sandbox",
          inline: true
        },
        {
          name: "period",
          value: "Define historical period - default 1 day",
          inline: true
        },
        {
          name: "\u200b",
          value: "\u200b",
          inline: false
        },
        {
          name: "/fc-search",
          value: "Retrieve currency id, name and symbol",
          inline: true
        },
        {
          name: "symbol",
          value: "Currency symbol - eg: sand",
          inline: true
        },
        {
          name: "\u200b",
          value: "\u200b",
          inline: false
        },
        {
          name: "/fc-sync",
          value: "Update currencies data file from CoinGeckoApi list endpoint",
          inline: true
        },
        {
          name: "\u200b",
          value: "\u200b",
          inline: false
        },
        {
          name: "/fc-help",
          value: "Display this message, giving informations",
          inline: true
        }
      ],
      footer: {
        text: "https://github.com/BlueSkunka/forge-crypto"
      }
    });

    interaction.reply({ embeds: [embedMessage] });
  },
};
