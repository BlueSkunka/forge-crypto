const rp = require("request-promise");
const config = require('config');
const cron = require("cron");
const { etherscanApiKey } = config.bot;
const { User } = require("discord.js");

module.exports = class GastrackerModule {

    static gastrackerEndpoint =
        "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=__apiKey__";

    //: Cron Tasks
    static cronGastrackerFn = async function (user) {
        await rp({
            method: "GET",
            uri: GastrackerModule.gastrackerEndpoint.replace(/__apiKey__/g, etherscanApiKey),
            headers: { "Content-Type": "application/json" },
            json: true,
        })
            .then((response) => {
                let safe = response["result"]["SafeGasPrice"];
                let proposed = response["result"]["ProposeGasPrice"];
                let fast = response["result"]["FastGasPrice"];
                let base = Math.floor(response["result"]["suggestBaseFee"]);

                user.setActivity(
                    `Gas: ${safe} | ${proposed} | ${fast} | Base: ${base}`
                );
            })
            .catch((err) => {
                console.log(err);
            });
    };

    static start(user) {
        // Toutes les 5 secondes
        let cronGastracker = new cron.CronJob("*/10 * * * * *", GastrackerModule.cronGastrackerFn(user));
        cronGastracker.start();
    }

}