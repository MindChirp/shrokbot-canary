const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cap')
    .setDescription("That's cap")
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to cap')
    ),

  async execute(interaction, client) {
    if (interaction.options.getUser('user')) {
      interaction.reply(
        interaction.options.getUser('user').toString() + " That's cap"
      );
    } else {
      interaction.reply("That's cap");
    }
  },
};
