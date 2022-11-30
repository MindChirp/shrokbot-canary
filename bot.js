const {Client, GatewayIntentBits, Collection} = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

const fs = require('node:fs');

// Load the config
dotenv.config();

// Set the token
const token = process.env.DISCORD_TOKEN;

// Check if production
const production = process.env.PRODUCTION;

if (production) {
  console.log('The bot is running in production!');
}

// Create a new client!
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.commands = new Collection();
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property!`
    );
  }
}

// Sign in to discord with the token
client.login(token);

module.exports = {client};
