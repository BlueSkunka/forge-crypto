//: /get {pair}

const { SlashCommandBuilder } = require("@discordjs/builders");
const { apiToken } = require("../config.json");
const rp = require("request-promise");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { Chart } = require("chart.js");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const DEFAULT_COIN = "bitcoin";
const DEFAULT_CONVERT = "usd";
const DEFAULT_PERIOD = 60 * 60 * 24 - 1; //24h
const DEFAULT_GRANULARITY = 1;
const COINGECKO_API =
  "https://api.coingecko.com/api/v3/coins/__id__/market_chart/range";
let chartEmbed = {};
let coinData = {};

const generateCanva = async (labels, datas, convert) => {
  const renderer = new ChartJSNodeCanvas({ width: 800, height: 300 });
  const image = await renderer.renderToBuffer({
    type: "line", // Show a bar chart
    backgroundColor: "rgba(236,197,1)",
    data: {
      labels: labels, // Set X-axis labels
      datasets: [
        {
          label: convert, // Create the 'Users' dataset
          data: datas, // Add data to the chart
        },
      ],
    },
  });
  return new MessageAttachment(image, "graph.png");
};

module.exports = {
  data: new SlashCommandBuilder()
    //#region Slash COmmand Builder
    .setName("fc-get")
    .setDescription("Generate graphic from coin historical data")
    .addStringOption((option) =>
      option
        .setName("symbol")
        .setDescription(
          "Insert a crypto currency symbol like 'btc' or with pairing 'btc/usdt'. Default pairing: usdt "
        )
    )
    .addStringOption((option) =>
      option
        .setName("period")
        .setDescription("Define the period to fetch coin data")
        .setRequired(false)
        .addChoice("1 jour", (60 * 60 * 24 - 1).toString())
        .addChoice("7 jours", (60 * 60 * 24 * 7).toString())
        .addChoice("14 jours", (60 * 60 * 24 * 14).toString())
        .addChoice("30 jours", (60 * 60 * 24 * 30).toString())
    ),
  //#endregion Slash Command Builder
  async execute(interaction) {
    //#region coingecko
    //? Deconstruct command option Symbol
    const pairing = !interaction.options.getString("symbol")
      ? ""
      : interaction.options.getString("symbol").trim().split("/");

    //? Define request query parameters
    const symbol = !pairing[0] ? DEFAULT_COIN : pairing[0];
    const convert = !pairing[1] ? DEFAULT_CONVERT : pairing[1];
    const to = Date.now() / 1000;
    const from =
      to -
      (!interaction.options.getString("period")
        ? DEFAULT_PERIOD
        : interaction.options.getString("period"));
    //: Build request to CoinMarketCap API
    const requestOptions = {
      method: "GET",
      uri: COINGECKO_API.replace(/__id__/g, symbol),
      qs: {
        vs_currency: convert,
        from: from,
        to: to,
      },
      headers: {
        "Content-Type": "application/json",
      },
      json: true,
    };

    //: Request CoinGecko Api
    await rp(requestOptions)
      .then((response) => {
        // Get currency information
        coinData = response["prices"];
      })
      .catch((err) => {
        console.log("API call error:", err.message);
        interaction.reply(err.message);
      });
    //#endregion coingecko

    //#region chart
    let labels = [];
    let data = [];
    // console.log(coinData.length);
    for (let i = 0; i < coinData.length; i++) {
      console.log(coinData[i]);
      let date = new Date(coinData[i][0]);
      labels.push(
        date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
      );
      data.push(coinData[i][1]);
    }

    chartEmbed = new MessageEmbed({
      title: symbol,
      color: "YELLOW",
    });
    chartEmbed.setImage("attachment://graph.png");
    const attachment = await generateCanva(labels, data, convert);

    interaction.reply({ embeds: [chartEmbed], files: [attachment] });
    //#endregion
  },
};
