const {SlashCommandBuilder, ChannelType} = require('discord.js');
const {GuildVoiceClasses} = require('../play/streams');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bind')
    .setDescription(
      'Binds bot communication to this, or a specified text channel'
    )
    .addChannelOption((option) =>
      option
        .addChannelTypes(ChannelType.GuildText)
        .setName('channel')
        .setDescription('An optional channel to select')
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    // Get the correct guild voice class instance
    const guildChannel = interaction.options.getChannel('channel');
    const guildId = interaction.guildId;
    const filtered = GuildVoiceClasses.filter(
      (object) => object.getGuildId() === guildId
    );

    if (filtered.length == 0) {
      interaction.editReply('The bot must be connected to a voice channel!');
      return;
    }

    const guildStream = filtered[0];

    const selectedChannel = guildChannel ?? interaction.channel;

    guildStream.setChatId(selectedChannel.id);
    await interaction.editReply(
      'Text communications have been bound to ' + selectedChannel.toString()
    );
  },
};
