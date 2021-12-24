//: /get {pair}

const { SlashCommandBuilder } = require("@discordjs/builders");
const { apiToken } = require("../config.json");
const rp = require("request-promise");
const { MessageEmbed } = require("discord.js");
const DEFAULT_CONVERT = "USD";
const DEFAULT_PERIOD = "24h";
const QUICKCHART_BASEURL = "https://quickchart.io";
const QUICKCHART_BASEPATH = "/chart/create";
let chartEmbed = {};

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
    )
    .addStringOption((option) =>
      option
        .setName("period")
        .setDescription("Define the period to return percent change")
        .setRequired(false)
        .addChoice("1 heure", "1h")
        .addChoice("24 heures", "24h")
        .addChoice("7 jours", "7d")
        .addChoice("30 jours", "30d")
    ),
  async execute(interaction) {
    //#region const
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
    //#endregion cosnt

    //#region chart
    const graph = {
      chart: {
        type: "bar", // Show a bar chart
        data: {
          labels: [2012, 2013, 2014, 2015, 2016], // Set X-axis labels
          datasets: [
            {
              label: "Users", // Create the 'Users' dataset
              data: [120, 60, 50, 180, 120], // Add data to the chart
            },
          ],
        },
      },
    };

    const requestOptionsGraph = {
      method: "POST",
      uri: "https://quickchart.io/chart/create",
      body: graph,
      headers: {
        "Content-Type": "application/json",
      },
      json: true,
    };

    await rp(requestOptionsGraph)
      .then((response) => {
        console.log(response);
        chartEmbed = new MessageEmbed({
          title: "Title",
          description: "Description with useless content.",
          color: "YELLOW",
          image: {
            url: response["url"],
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
    //#endregion

    //: Request Crypto Market Cap Api
    await rp(requestOptions)
      .then((response) => {
        // Get currency information
        const currency = response["data"][symbol];
        const quote = currency["quote"][convert];

        const name = currency["name"];
        const price = quote["price"].toFixed(5);
        const period = !interaction.options.getString("period")
          ? DEFAULT_PERIOD
          : interaction.options.getString("period");
        const percent = quote["percent_change_" + period].toFixed(2);

        interaction.reply(
          `${name}: ${price} ${convert} | ${percent}%  ${period}`
        );
      })
      .catch((err) => {
        console.log("API call error:", err.message);
        interaction.reply(
          "There was an error while fetching currency informations. \nPlease check that you entered a existing currency / pairing or period."
        );
      });
  },
};
