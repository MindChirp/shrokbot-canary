const {SlashCommandBuilder} = require('discord.js');
const {GuildVoiceClasses} = require('../play/streams');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fuckoff')
    .setDescription('Fucks the bot off')
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

    const guildStream = filtered[0];
    guildStream.stop();
    await interaction.editReply('Why do you have to be mad');
  },
};
