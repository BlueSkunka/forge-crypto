//: /get {pair}

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fc-get')
        .setDescription('Replies with current value of specified crypto pairing (default on ---/usdt)'),
    async execute(interaction) {
        await interaction.reply('WIP');
    },
};