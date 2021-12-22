//: /get {pair}

const { SlashCommandBuilder } = require("@discordjs/builders");
const { apiToken } = require("../config.json");
const rp = require("request-promise");
const DEFAULT_CONVERT = "USD";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc-get")
    .setDescription(
      "Replies with current value of specified crypto pairing (default on ---/usdt)"
    )
    .addStringOption((option) =>
      option
        .setName("symbol")
        .setDescription(
          "Insert a crypto currency symbol like 'btc' or with pairing 'btc/usdt'. Default pairing: usdt "
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    // Deconstruct command option Symbol
    const pairing = interaction.options
      .getString("symbol")
      .trim()
      .toUpperCase()
      .split("/");

    // Define request query parameters
    const symbol = pairing[0];
    const convert = !pairing[1] ? DEFAULT_CONVERT : pairing[1];
    //: Build request to CoinMarketCap API
    const requestOptions = {
      method: "GET",
      uri: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      qs: {
        symbol: symbol,
        convert: convert,
      },
      headers: {
        "X-CMC_PRO_API_KEY": `${apiToken}`,
      },
      json: true,
      gzip: true,
    };

    //: Request Crypto Market Cap Api
    await rp(requestOptions)
      .then((response) => {
        // Get currency information
        const currency = response["data"][symbol];
        const quote = currency["quote"][convert];

        const name = currency["name"];
        const price = quote["price"].toFixed(5);
        const percent = quote["percent_change_1h"].toFixed(2);

        interaction.reply(`${name}: ${price} ${convert} | ${percent}%`);
      })
      .catch((err) => {
        console.log("API call error:", err.message);
        interaction.reply(
          "There was an error while fetching currency informations. \nPlease check that you entered a existing currency / pairing."
        );
      });
  },
};
