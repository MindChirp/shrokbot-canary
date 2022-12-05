const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {GuildVoiceClasses} = require('../play/streams');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('effect')
    .setDescription('Adds effects to the audio player')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('The effect type')
        .addChoices(
          {name: 'Nightcore', value: 'nightcore'},
          {name: 'Vaporwave', value: 'vaporwave'},
          {name: 'Bassboost', value: 'bassboost'}
        )
    )
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

    // Get the command choice
    const option = interaction.options.getString('type');

    if (!option) {
      // Display a list of all the active effects
      const effectList = guildStream.getEffects();

      const embed = new EmbedBuilder()
        .setColor(0xe803fc)
        .setTitle('Current effects');

      let i = 1;
      for (const effect of effectList) {
        embed.addFields({name: i + '', value: effect});
        i++;
      }

      if (effectList.length == 0) {
        embed.setTitle('No effects have been applied');
      }

      interaction.editReply({
        embeds: [embed],
        components: [],
      });
    }
  },
};
