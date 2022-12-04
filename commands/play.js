const {SlashCommandBuilder} = require('discord.js');
const {collectors} = require('../play/collectors');
const {GuildVoiceClasses, GuildStream} = require('../play/streams');
const {searchAndReturnResult} = require('../play/findVideo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays music from youtube!')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Youtube video URL or title')
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(200)
    )
    .addChannelOption((option) =>
      option.setName('channel').setDescription('The channel to play music in')
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    await interaction.deferReply();

    // Check if there already exists a collector
    const foundCollector = collectors.filter(
      (object) => object.channelId == interaction.channelId
    );

    if (foundCollector.length > 0) {
      await interaction.followUp({
        content: 'Sorry, there is already an ongoing search!',
        ephemeral: true,
      });
      return;
    }

    // Check if there already exists a guildstream handler for this guild
    const guildStreams = GuildVoiceClasses;
    const filtered = guildStreams.filter(
      (object) => object.getGuildId() === interaction.guildId
    );

    let guildStream;
    if (filtered.length == 0) {
      // Create a guild stream handler for this guild
      guildStream = new GuildStream(
        interaction.guildId,
        interaction.channelId,
        client
      );

      GuildVoiceClasses.push(guildStream);
    } else {
      guildStream = filtered[0];
    }

    try {
      await searchAndReturnResult(
        query,
        interaction,
        client,
        guildStream,
        undefined
      );
    } catch (error) {
      console.error(error);
    }
  },
};
