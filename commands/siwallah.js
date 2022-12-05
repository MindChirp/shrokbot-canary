const {SlashCommandBuilder} = require('discord.js');

/**
 * THIS COMMAND IS EXCLUSIVELY FOR A SERVER OF A FRIEND OF MINE
 * -Frikk Balder
 */

module.exports = {
  data: new SlashCommandBuilder()
    .setName('siwallah')
    .setDescription('Sier wallah')
    .setDMPermission(false),

  async execute(interaction, client) {
    if (interaction.guild.id != '263300337320853505') {
      interaction.reply('This command is disabled for this server');
      return;
    }
    interaction.reply(interaction.member.toString() + ' wallah');
  },
};
