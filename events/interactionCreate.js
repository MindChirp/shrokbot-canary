const {Events} = require('discord.js');
const {partyTrick1} = require('../partytricks/adamDeny');
const {partyTrick3} = require('../partytricks/behrensHandler');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // Check if the bot is in mantenance mode
    const maintenance = process.env.MAINTENANCE;
    if (maintenance) {
      interaction.reply('Sorry! The bot is currently in maintenance mode!');
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        interaction.reply('Sorry! No matching commands were found!');
        return;
      }

      // Adam handler (custom party trick intended for personal use)
      const result = partyTrick1(interaction);
      if (result) return;

      // Behrens handler (custom party trick intended for personal use)
      const result1 = partyTrick3(interaction);
      if (result1) {
        console.log('Pranked behrens!');
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(
          `Could not execute the command ${interaction.commandName}`
        );
        console.error(error);
        interaction.editReply('Sorry, an unexpected error occured.');
      }
    }
  },
};
