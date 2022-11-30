const {Events} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        interaction.reply('Sorry! No matching commands were found!');
        return;
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
    } else if (interaction.isButton()) {
    }
  },
};
