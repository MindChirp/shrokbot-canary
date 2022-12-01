const {SlashCommandBuilder} = require('discord.js');
const {collectors} = require('../play/collectors');
const {nowPlayingEmbed} = require('../play/nowPlayingEmbed');
const {searchResults} = require('../play/searchEmbed');
const {youtubeSearch} = require('../play/youtubeSearch');
const {v4: uuidv4} = require('uuid');
const {GuildVoiceClasses, GuildStream} = require('../play/streams');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playtop')
    .setDescription('Inserts a song after the currently playing song')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Youtube video URL or title')
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(200)
    )
    .setDMPermission(false),

  async execute(interaction, client) {
    const query = interaction.options.getString('query');
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

    if (guildStream.getQueue().length == 0) {
      await interaction.editReply(
        'There must be at least one video in the queue to perform this action!'
      );
      return;
    }

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

    // Search youtube
    const [list, video] = await youtubeSearch(query);

    // If the youtube search results is a single object, and not an array,
    if (video) {
      // const nowPlaying = nowPlayingEmbed(video, client);

      const nowPlaying = nowPlayingEmbed(video, client);
      await interaction.editReply({
        embeds: [nowPlaying],
        components: [],
      });

      const user = interaction.member;
      const channel = user.voice.channel;
      if (!channel) {
        // The user is not connected to a voice channel
        await interaction.editReply({
          content:
            "Sorry, but it seems like you aren't connected to a voice channel.",
          embeds: [],
          components: [],
        });

        // Remove all collectors
        removeCollector(collector);
        return;
      }

      // Connect to the active voice channel
      await guildStream.connectToVC(channel.id);

      // Create an audio stream, and pipe it to the voice channel
      const selectedVideo = video;
      guildStream.insertToQueue(selectedVideo, 1);

      return;
    }

    // Show an interactive chat message
    const searchRes = await searchResults(list);

    if (searchRes.length == 1) {
      // Only show a message prompt, no buttons
      await interaction.editReply({
        embeds: [searchRes[0]],
        components: [],
      });
    } else if (searchRes.length == 2) {
      // Show an embed with list options
      await interaction.editReply({
        embeds: [searchRes[0]],
        components: [searchRes[1]],
      });
    }

    let embedHasBeenInteractedWith = false;

    // Set up a collector to listen to the button presses
    const collector = interaction.channel.createMessageComponentCollector({
      time: 15000,
      max: 1,
    });

    // Assign an uuid to the collector, and save it to a global collector array
    collector.uuid = uuidv4();
    addCollector(collector);

    // Handle collector events
    collector.on('collect', async (i) => {
      // Update the embed interaction state
      embedHasBeenInteractedWith = true;

      if (i.customId == '5') {
        // The cancel button has been pressed
        await interaction.deleteReply();
        removeCollector(collector);
        collector.stop();
        return;
      }
      // Replace embed with now playing embed
      const nowPlaying = nowPlayingEmbed(list[parseInt(i.customId)], client);

      await interaction.editReply({
        embeds: [nowPlaying],
        components: [],
      });

      // Check if there already exists a guildstream handler for this guild
      const guildStreams = GuildVoiceClasses;
      for (guild of guildStreams) {
      }
      const filtered = guildStreams.filter(
        (object) => object.getGuildId() === interaction.guildId
      );

      let guildStream;
      if (filtered.length == 0) {
        // Create a guild stream handler for this guild
        guildStream = new GuildStream(interaction.guildId, client);
        GuildVoiceClasses.push(guildStream);
      } else {
        guildStream = filtered[0];
      }

      const user = interaction.member;
      const channel = user.voice.channel;
      if (!channel) {
        // The user is not connected to a voice channel
        await interaction.editReply({
          content:
            "Sorry, but it seems like you aren't connected to a voice channel.",
          embeds: [],
          components: [],
        });

        // Remove all collectors
        removeCollector(collector);
        return;
      }

      // Connect to the active voice channel
      await guildStream.connectToVC(channel.id);

      // Create an audio stream, and pipe it to the voice channel
      const selectedVideo = list[parseInt(i.customId)];
      guildStream.insertToQueue(selectedVideo, 1);
    });

    // When the time limit has been reached (15s), delete the message if it hasn't been interacted with
    collector.on('end', async (collected) => {
      console.log(`Collected ${collected.size} item(s)`);
      if (!embedHasBeenInteractedWith) {
        await interaction.deleteReply();
      }

      removeCollector(collector);
    });
  },
};

/**
 * Removes the specified collector from the collector list
 *
 * @param {Collector} collector The collector to remove
 */
function removeCollector(collector) {
  // Remove the collector from the collectors array
  const index = collectors.findIndex((object) => {
    return object.uuid == collector.uuid;
  });

  if (index != -1) {
    collectors.splice(index, 1);
  }
}

/**
 *  Adds the specified collector to the collector list
 *
 * @param {Collector} collector The collector to add to the collector list
 */
function addCollector(collector) {
  if (!collector.uuid) {
    collector.uuid = uuidv4();
  }

  collectors.push(collector);
}
