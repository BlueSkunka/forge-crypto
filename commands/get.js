//: /get {pair}

const { SlashCommandBuilder } = require("@discordjs/builders");
const { apiToken } = require("../config.json");
const rp = require("request-promise");
const requestOptions = {
  method: "GET",
  uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
  qs: {
    start: "1",
    limit: "5000",
    convert: "USD",
  },
  headers: {
    "X-CMC_PRO_API_KEY": `${apiToken}`,
  },
  json: true,
  gzip: true,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc-get")
    .setDescription(
      "Replies with current value of specified crypto pairing (default on ---/usdt)"
    ),
  async execute(interaction) {
    await rp(requestOptions)
      .then((response) => {
        console.log("API call response:", response);
        interaction.reply("Look console :) ");
      })
      .catch((err) => {
        console.log("API call error:", err.message);
      });
  },
};
