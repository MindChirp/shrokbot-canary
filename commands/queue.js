const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {GuildVoiceClasses} = require('../play/streams');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Shows the current queue')
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

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

    // Generate a queue list .O.
    if (queue.length == 0) {
      interaction.editReply('There are no songs in the queue!');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xe803fc)
      .setTitle('Current queue');

    let i = 0;
    for (const video of queue) {
      i++;
      embed.addFields({name: i + '', value: video.title});
    }

    interaction.editReply({
      embeds: [embed],
      components: [],
    });
  },
};
