const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {GuildVoiceClasses} = require('../play/streams');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes the given index from the queue')
    .addIntegerOption((option) =>
      option
        .setMinValue(1)
        .setName('index')
        .setDescription('Index of the video to remove')
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

    const number = interaction.options.getInteger('index');

    // Get the correct guild voice class instance
    const guildId = interaction.guildId;
    const filtered = GuildVoiceClasses.filter(
      (object) => object.getGuildId() === guildId
    );

    if (filtered.length == 0) {
      interaction.editReply('There are no songs in the queue!');
      return;
    }
    const guildStreamer = filtered[0];

    const queue = guildStreamer.getQueue();

    if (queue.length == 0) {
      interaction.editReply('There are no songs in the queue!');
      return;
    } else if (queue.length == 1) {
      interaction.editReply('There are not enough songs in the queue!');
    }

    if (number > queue.length - 1 || number <= 0) {
      await interaction.editReply('The given index is out of bounds!');
      return;
    }

    // Get the video that will be removed
    const video = queue[number];

    try {
      guildStreamer.removeFromQueue(number);
    } catch (error) {
      console.error(error);
      await interaction.editReply('An error occured while editing the queue.');

      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xfc0339)
      .setAuthor({
        name: 'Removed from queue',
        iconURL: client.user.displayAvatarURL(),
        url: video.url,
      })
      .setTitle(video.title)
      .setThumbnail(video.image)
      .addFields(
        {name: 'Channel', value: video.author.name, inline: true},
        {name: 'Length', value: video.timestamp, inline: true}
      );

    interaction.editReply({
      embeds: [embed],
      components: [],
    });
  },
};
