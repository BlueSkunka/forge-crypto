//: /get {pair}

const { SlashCommandBuilder } = require("@discordjs/builders");
const rp = require("request-promise");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const DEFAULT_COIN = "bitcoin";
const DEFAULT_CONVERT = "usd";
const DEFAULT_PERIOD_1_DAY = 60 * 60 * 24; //24h
const DEFAULT_PERIOD_7_DAY = DEFAULT_PERIOD_1_DAY * 7;
const DEFAULT_PERIOD_14_DAY = DEFAULT_PERIOD_1_DAY * 14;
const DEFAULT_PERIOD_30_DAY = DEFAULT_PERIOD_1_DAY * 30;
const DEFAULT_PERIOD = DEFAULT_PERIOD_1_DAY;
const COINGECKO_API =
  "https://api.coingecko.com/api/v3/coins/__id__/market_chart/range";
let chartEmbed = {};
let coinData = {};

module.exports = {
  data: new SlashCommandBuilder()
    //#region Slash COmmand Builder
    .setName("fc-get")
    .setDescription(
      "Generate graphic from coin historical data - see help command for more details (WIP)"
    )
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
        .addChoice("1 jour", DEFAULT_PERIOD_1_DAY.toString())
        .addChoice("7 jours", DEFAULT_PERIOD_7_DAY.toString())
        .addChoice("14 jours", DEFAULT_PERIOD_14_DAY.toString())
        .addChoice("30 jours", DEFAULT_PERIOD_30_DAY.toString())
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
    const period = !interaction.options.getString("period")
      ? DEFAULT_PERIOD
      : interaction.options.getString("period");
    const from = to - period;
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
        //TODO stat sur coingecko + crypto
        return;
      });
    //#endregion coingecko

    //#region chart
    let labels = [];
    let data = [];

    //Omit first data for display purpose
    for (let i = 0; i < coinData.length; i++) {
      let date = new Date(coinData[i][0]);

      // Build label
      if (period === DEFAULT_PERIOD_1_DAY) {
        labels.push(date.getHours() + "h" + date.getMinutes());
      } else {
        labels.push(
          date.getDate() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getFullYear()
        );
      }

      // data
      data.push(coinData[i][1]);
    }

    const generateCanva = async (labels, datas, convert) => {
      const renderer = new ChartJSNodeCanvas({
        type: "png",
        width: 1600,
        height: 600,
        backgroundColour: "#333333",
      });
      const image = await renderer.renderToBuffer({
        type: "line", // Show a bar chart
        data: {
          labels: labels, // Set X-axis labels
          datasets: [
            {
              label: convert, // Create the 'Users' dataset
              data: datas, // Add data to the chart
              backgroundColor: "#)=ecc501",
              borderColor: "#ecc501",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                callback: function (val, index) {
                  switch (period) {
                    case DEFAULT_PERIOD_7_DAY:
                      return index % 7 === 0 ? this.getLabelForValue(val) : "";
                      break;
                    case DEFAULT_PERIOD_14_DAY:
                      return index % 14 === 0 ? this.getLabelForValue(val) : "";
                      break;
                    case DEFAULT_PERIOD_30_DAY:
                      return index % 30 === 0 ? this.getLabelForValue(val) : "";
                      break;
                    default:
                      return index % 3 === 0 ? this.getLabelForValue(val) : "";
                      break;
                  }
                },
              },
            },
          },
          elements: {
            point: {
              radius: 0,
            },
          },
        },
      });
      return new MessageAttachment(image, "graph.png");
    };

    chartEmbed = new MessageEmbed({
      title: symbol + "/" + convert,
      color: "YELLOW",
    });
    chartEmbed.setImage("attachment://graph.png");
    const attachment = await generateCanva(labels, data, convert);
    const getTitle = async () => {
      let min = coinData[0][1];
      let max = coinData[coinData.length - 1][1];
      let percent = ((max - min) * 100) / max;
      let sign = "";
      if (Math.sign(percent) > 0) sign = "+";
      if (Math.sign(percent) < 0) sign = "-";
      return (
        sign +
        " " +
        Math.round(Math.abs(percent) * 100) / 100 +
        "% en " +
        period / 86400 +
        " jours"
      );
    };
    chartEmbed.setDescription(await getTitle());

    interaction.reply({ embeds: [chartEmbed], files: [attachment] });
    //#endregion
  },
};
