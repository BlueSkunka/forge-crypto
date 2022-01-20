const { SlashCommandBuilder } = require("@discordjs/builders");
const FileModule = require("./../modules/file.js");
const filePath = "currencies.json";
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fc-search")
        .setDescription("Search for currency name from symbol")
        .addStringOption((option) =>
            option.setName("symbol").setDescription("Search for currency info").setRequired(true)
        ),
    async execute(interaction) {
        const currencies = FileModule.ReadFile(filePath);

        if (null == currencies) {
            interaction.reply(
                "Currencies file isn't up to date, please use sync command."
            );
            return;
        }

        let symbol = interaction.options.getString("symbol");
        let hasMatched;
        let matchedCurrencies = [];

        for (let i = 0; i < Object.keys(currencies).length; i++) {
            if (
                currencies[i]["symbol"] == symbol ||
                currencies[i]["id"] == symbol ||
                currencies[i]["name"] == symbol
            ) {
                matchedCurrencies.push(currencies[i]);
                hasMatched = true;
            }
        }

        if (!hasMatched) {
            interaction.reply("Not match found :(");
        } else {
            let response = JSON.stringify(matchedCurrencies);
            response = response
                .replace(/\[\{/g, "")
                .replace(/\}\]/g, "")
                .replace(/\}\,\{/g, " \n ");

            let embedMessage = new MessageEmbed({
                title: "Correspondances",
                color: "YELLOW",
                description: response
            });

            interaction.reply({ embeds: [embedMessage] });
        }
    },
};
