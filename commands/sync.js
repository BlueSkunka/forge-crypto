const { SlashCommandBuilder } = require("@discordjs/builders");
const rp = require("request-promise");
const COINGECKO_API = "https://api.coingecko.com/api/v3/coins/list";
const FileModule = require("./../modules/file.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc-sync")
    .setDescription("Sync currencies mock file with coin gecko"),
  async execute(interaction) {
    await rp({
      method: "GET",
      uri: COINGECKO_API,
      headers: {
        "Content-Type": "application/json",
      },
      json: true
    })
      .then((response) => {
        FileModule.WriteFile("currencies.json", JSON.stringify(response, null, 2));

        interaction.reply("List of all crpto currency has been updated !");
      }).catch((err) => {
        console.error(err);

        interaction.reply("Error while fetching crypto currencies data. Please retry later or contact bot maintainer (see help command)");
      });


  },
};
