const {createAudioResource} = require('@discordjs/voice');
const {SlashCommandBuilder} = require('discord.js');
const path = require('path');
const {GuildVoiceClasses, GuildStream} = require('../play/streams');
/**
 * The /donkey command is a meme-command, and just for fun.
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('donkey')
    .setDescription('Plays a nice little sound in your voice channel.')
    .setDMPermission(false),

  async execute(interaction, client) {
    await interaction.deferReply();

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

    // Check if the user is connected to a voice channel
    const user = interaction.member;
    const channel = user.voice.channel;

    guildStream.connectToVC(channel.id);

    interaction.editReply('As you wish.');

    const resource = createAudioResource(
      path.join(path.dirname(__dirname), 'partytricks', 'sounds', 'donkey.mp3'),
      {
        metadata: {
          title: 'A good song!',
        },
      }
    );

    guildStream
      .pipeStream(resource)
      .then((res) => {
        // Disconnect
        guildStream.stop();
      })
      .catch((err) => {
        console.error(err);
        interaction.editReply('Sorry! Something went wrong.');
      });
  },
};
