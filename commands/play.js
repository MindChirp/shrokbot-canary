const {SlashCommandBuilder} = require('discord.js');
const {collectors} = require('../play/collectors');
const {addedToQueueEmbed} = require('../play/addedToQueueEmbed');
const {searchResults} = require('../play/searchEmbed');
const {youtubeSearch} = require('../play/youtubeSearch');
const {v4: uuidv4} = require('uuid');
const {GuildVoiceClasses, GuildStream} = require('../play/streams');

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

    const user = interaction.member;

    // Check if the user is connected to a voice channel
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

    // Control guildStream chatId status
    // (might be undefined if the bot has been disconnected from the voice channel)
    const chat = guildStream.getChatId();
    if (!chat) {
      guildStream.setChatId(interaction.channelId);
    }

    // Search youtube
    youtubeSearch(query).then(processSearchResult);

    /**
     * Handles the youtube search results
     *
     * @param {array} param0 Args
     * @return {undefined}
     */
    async function processSearchResult([list, video]) {
      // If the youtube search results is a single object, and not an array,
      if (video) {
        const selectedVideo = video;
        if (guildStream.getQueue().length > 0) {
          guildStream.addToQueue(selectedVideo);
        } else {
          guildStream.connectToVC(channel.id);
          guildStream.addToQueue(selectedVideo);
          guildStream.play();
        }

        // Replace the old embed with an added to queue message
        if (guildStream.getQueue().length > 1) {
          const addedToQueue = addedToQueueEmbed(video, client);
          await interaction.editReply({
            embeds: [addedToQueue],
            components: [],
          });
        } else {
          await interaction.deleteReply();
        }

        return;
      }

      // Show an interactive chat message
      const searchRes = await searchResults(list);

      handleResult(searchRes);
      createCollector(list);

      /**
       * Handles the youtube search query result
       * @param {EmbedBuilder} searchRes The searchRes embed to display in chat
       */
      async function handleResult(searchRes) {
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
      }
    }

    /**
     * Creates a collector, enabling us to listen to button presses in chat
     *
     * @param {array} list List of videos from the youtube search
     */
    function createCollector(list) {
      let embedHasBeenInteractedWith = false;

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

        const selectedVideo = list[parseInt(i.customId)];

        const videoSuccess = async () => {
          guildStream.addToQueue(selectedVideo);
          guildStream.play();

          // Replace the old embed with an added to queue message if the queue is not empty
          if (guildStream.getQueue().length > 1) {
            const addedToQueue = addedToQueueEmbed(selectedVideo, client);
            await interaction.editReply({
              embeds: [addedToQueue],
              components: [],
            });
          } else {
            await interaction.deleteReply();
          }
        };

        if (guildStream.getQueue().length > 0) {
          guildStream.addToQueue(selectedVideo);
        } else {
          guildStream
            .connectToVC(channel.id)
            .then(videoSuccess)
            .catch(async (err) => {
              console.error(err);
              await interaction.editReply('Could not play the video!');
            });
        }
      });

      // When the time limit has been reached (15s), delete the message if it hasn't been interacted with
      collector.on('end', async (collected) => {
        console.log(`Collected ${collected.size} item(s)`);
        if (!embedHasBeenInteractedWith) {
          await interaction.deleteReply();
        }

        removeCollector(collector);
      });
    }
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
