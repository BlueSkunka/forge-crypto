// Require the necessary discord.js classes
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const StatModule = require("./modules/stats.js");
const GastrackerModule = require("./modules/gastracker");

const config = require('config');
const { token } = config.bot;

// Used for Welcoming feature
const WelcomingModule = require("./modules/welcoming.js");


WelcomingModule.FetchAvailableLanguages();



// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });

client.commands = new Collection();

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

  GastrackerModule.start(client.user);
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
