// Require the necessary discord.js classes
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { dirname } = require("path");
const StatModule = require("./modules/stats.js");
const rp = require("request-promise");
const cron = require("cron");

const config = require('config');
const { token, etherscanApiKey, deeplKey } = config.bot;

// Used for Welcoming feature
const WelcomingModule = require("./modules/welcoming.js");


WelcomingModule.FetchAvailableLanguages();

// gastracker
const gastrackerEndpoint =
  "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=__apiKey__";

//: Cron Tasks
const cronGastrackerFn = async function () {
  await rp({
    method: "GET",
    uri: gastrackerEndpoint.replace(/__apiKey__/g, etherscanApiKey),
    headers: { "Content-Type": "application/json" },
    json: true,
  })
    .then((response) => {
      let safe = response["result"]["SafeGasPrice"];
      let proposed = response["result"]["ProposeGasPrice"];
      let fast = response["result"]["FastGasPrice"];
      let base = Math.floor(response["result"]["suggestBaseFee"]);

      client.user.setActivity(
        `Gas: ${safe} | ${proposed} | ${fast} | Base: ${base}`
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });

client.commands = new Collection();
console.log(__dirname);
// Read commands folder
const commandFiles = fs
  .readdirSync(__dirname.concat("/commands"))
  .filter((file) => file.endsWith(".js"));

// Register commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Forge | Crypto is ready to work !");

  // Toutes les 5 secondes
  let cronGastracker = new cron.CronJob("*/10 * * * * *", cronGastrackerFn);
  cronGastracker.start();
});

// Listen on new interaction
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
    StatModule.CountCommand(command.data.name, false);
  } catch (error) {
    console.error(error);
    StatModule.CountCommand(command.data.name, true);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});



/**
 * Listen on new member join our discord
 */
client.on('guildMemberAdd', member => {
  WelcomingModule.MemberWelcoming(member);
});

// Login to Discord with your client's token
client.login(token);
