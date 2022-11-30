const {SlashCommandBuilder} = require('discord.js');
const {GuildVoiceClasses} = require('../play/streams');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the current song')
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    // Get the correct guild voice class instance
    const guildId = interaction.guildId;
    const filtered = GuildVoiceClasses.filter(
      (object) => object.getGuildId() === guildId
    );

    if (filtered.length == 0) {
      interaction.editReply('The bot must be connected to a voice channel!');
      return;
    }

    if (filtered[0].getQueue().length > 0) {
      filtered[0].skip();
      interaction.editReply('The current song is skipped!');
    } else {
      interaction.editReply('There are no songs to skip!');
    }
  },
};
