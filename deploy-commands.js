const {REST, Routes} = require('discord.js');
const fs = require('node:fs');
const dotenv = require('dotenv');

// Load the environment variables
dotenv.config();

// Set the token
const token = process.env.DISCORD_TOKEN;

// Set the client id
const clientId = process.env.CLIENT_ID;

// Create an empty array for the command exports to be stored in
const commands = [];

// Grab all the command files
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

// Iterate through every command file, and require it
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// Set up an instance of the REST module
const rest = new REST({version: '10'}).setToken(token);
// Deploy the commands

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
