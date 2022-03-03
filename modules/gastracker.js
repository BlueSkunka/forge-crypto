const rp = require("request-promise");
const config = require('config');
const cron = require("cron");
const { etherscanApiKey } = config.bot;

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
                const safe = response["result"]["SafeGasPrice"];
                const proposed = response["result"]["ProposeGasPrice"];
                const fast = response["result"]["FastGasPrice"];
                const base = Math.floor(response["result"]["suggestBaseFee"]);

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
        const cronGastracker = new cron.CronJob("*/5 * * * * *", GastrackerModule.cronGastrackerFn(user));
        cronGastracker.start();
    }

}