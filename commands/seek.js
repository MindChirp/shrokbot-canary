const {SlashCommandBuilder} = require('discord.js');
const {GuildVoiceClasses} = require('../play/streams');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seeks to a given time')
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    // Get the correct guild voice class instance
    const guildId = interaction.guildId;
    const filtered = GuildVoiceClasses.filter(
      (object) => object.getGuildId() === guildId
    );

    if (filtered.length == 0) {
      interaction.editReply("The bot isn't associated to a guild.");
      return;
    }

    const guildStream = filtered[0];

    // Get the currently playing video
    // const video = guildStream.getQueue();
  },
};
