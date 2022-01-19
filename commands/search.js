const { SlashCommandBuilder } = require('@discordjs/builders');
const FileModule = require("./../modules/file.js");
const filePath = "currencies.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fc-search")
        .setDescription("Search for currency name from symbol")
        .addStringOption((option) => {
            option.setName("Symbol")
                .setRequired(true)
        }),
    async execute(interaction) {
        const currencies = FileModule.ReadFile(filePath);

        if (null == currencies) {
            interaction.reply("Currencies file isn't up to date, please use sync command.");
            return;
        }

        let symbol = interaction.options.getString("symbol");
        console.info(currencies);
        interaction.reply("Work In Progress.");
    }
}