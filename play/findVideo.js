const {
  addedToQueueEmbed,
  playlistAddedToQueueEmbed,
} = require('./addedToQueueEmbed');
const {searchResults} = require('./searchEmbed');
const {v4: uuidv4} = require('uuid');
const {addCollector, removeCollector} = require('./collectors');
const yts = require('yt-search');
/**
 *
 * @param {string} query A text query
 * @param {interaction} interaction A discord message interaction
 * @param {Client} client The bot client
 * @param {GuildStream} guildStreamer The guild streamer class instance
 * @param {number} indexInjection The queue index to insert the given song
 */
async function searchAndReturnResult(
  query,
  interaction,
  client,
  guildStreamer,
  indexInjection
) {
  /**
   * 1. Parse the query, figure out whether it is a link, search term or a playlist
   * 2. If search term, search youtube, and display a list with options
   * 3. If link, fetch the video id, search youtube with the given id, add it to the queue, and play it.
   * 4. If playlist, fetch the playlist id, queue every song in the playlist
   * 5. Always return the
   */

  if (!isNaN(indexInjection)) {
    if (
      indexInjection < 1 ||
      indexInjection > guildStreamer.getQueue().length
    ) {
      throw new RangeError('indexInjection argument is out of bounds');
    }
  }

  const queryParsed = parseQuery(query);

  const user = interaction.member;

  // Check if the user is connected to a voice channel
  const channel = user.voice.channel;

  try {
    /* eslint-disable no-var -- Allow the use of var in this trycatch block */
    var searchResult = await yts(queryParsed.query);
    /* eslint-enable */
  } catch (error) {
    console.error(error);
    interaction.editReply("I'm sorry, but I could not play this.");
    return;
  }

  if (queryParsed.type == 'playlist') {
    // Add each single video to the queue, ignore the indexInjection parameter

    const playImmedeately = guildStreamer.getQueue().length > 0 ? false : true;

    if (playImmedeately) {
      guildStreamer.connectToVC(channel.id);
    }

    const videos = searchResult.videos;

    // Create a proper url for every video object, and add it to the queue
    for (const video of videos) {
      video.url = 'https://www.youtube.com/watch?v=' + video.videoId;
      guildStreamer.addToQueue(video);
    }

    // Display a playlist added to queue embed
    const embed = playlistAddedToQueueEmbed(searchResult, client);
    interaction.editReply({
      embeds: [embed],
      components: [],
    });

    if (playImmedeately) {
      guildStreamer.play();
    }
  } else if (queryParsed.type == 'url') {
    // Add the single video to the queue
    if (guildStreamer.getQueue().length > 0) {
      // Only add the song to the queue.
      const index = guildStreamer.getQueue().length;

      // Insert video at either indexInjection, or at the default index
      guildStreamer.insertToQueue(searchResult, indexInjection ?? index);

      // Display an added to queue embed
      const embed = addedToQueueEmbed(searchResult, client);
      interaction.editReply({
        embeds: [embed],
        components: [],
      });
    } else {
      // Play this video immideately
      guildStreamer.connectToVC(channel.id);
      guildStreamer.addToQueue(searchResult);
      guildStreamer.play();

      // Remove the 'shrokbot is thinking...' text
      interaction.deleteReply();
    }
  } else if (queryParsed.type == 'text') {
    // Perform a normal user selection process using collectors etc.
    // Shorten the results list down to 4 videos
    if (!Array.isArray(searchResult.videos)) {
      interaction.editReply(
        "I'm sorry, but I received a malformed result from YouTube."
      );
      return;
    }

    const videos = searchResult.videos.slice(0, 4);
    const resultEmbed = searchResults(videos);

    if (resultEmbed.length > 1) {
      interaction.editReply({
        embeds: [resultEmbed[0]],
        components: [resultEmbed[1]],
      });
    } else {
      interaction.editReply({
        embeds: [resultEmbed[0]],
        components: [],
      });

      return;
    }

    // Set up collectors
    try {
      /* eslint-disable no-var -- Allow the use of var in this trycatch block */
      var video = await createCollector(videos, interaction);
      /* eslint-enable */
    } catch (error) {
      console.error(error);
      interaction.editReply("I'm sorry, but I could not play that video.");
      return;
    }

    // Check collector status
    if (video.status == 'timed-out' || video.status == 'cancelled') {
      // Abort the searching process
      interaction.deleteReply();
      return;
    }

    video = video.video;

    if (guildStreamer.getQueue().length > 0) {
      const index = guildStreamer.getQueue().length;
      guildStreamer.insertToQueue(video, indexInjection ?? index);

      // Send a queue embed in the chat
      const embed = addedToQueueEmbed(video, client);
      interaction.editReply({
        embeds: [embed],
        components: [],
      });
    } else {
      // The video should be played immedeately
      guildStreamer.connectToVC(channel.id);
      guildStreamer.addToQueue(video);
      guildStreamer.play();

      // Remove the 'shrokbot is thinking...' text
      interaction.deleteReply();
    }
  }
}

/**
 * Parses the query, returning a fitting object
 *
 * @param {string} query The query to parse
 * @return {object} The parsed query object
 */
function parseQuery(query) {
  if (query.split('&list=').length > 1) {
    return {
      type: 'playlist',
      query: {listId: query.split('&list=')[1].split('&')[0]},
    };
  } else if (query.split('/watch?v=').length > 1) {
    return {
      type: 'url',
      query: {videoId: query.split('/watch?v=')[1].split('&')[0]},
    };
  } else {
    // It is a normal text query
    return {type: 'text', query: query};
  }
}

/**
 * Creates a collector, enabling us to listen to button presses in chat
 *
 * @param {array} list List of videos from the youtube search
 * @param {interaction} interaction The chat interaction object
 * @return {object} Status and selected videos
 */
function createCollector(list, interaction) {
  return new Promise((resolve, reject) => {
    let embedHasBeenInteractedWith = false;

    const returnObject = {
      status: undefined,
      video: undefined,
    };

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
        removeCollector(collector);
        collector.stop();

        returnObject.status = 'cancelled';
        returnObject.video = undefined;
        resolve(returnObject);
        return;
      }

      const selectedVideo = list[parseInt(i.customId)];
      console.log(selectedVideo);
      returnObject.status = 'success';
      returnObject.video = selectedVideo;
      resolve(returnObject);
    });

    // When the time limit has been reached (15s), delete the message if it hasn't been interacted with
    collector.on('end', async (collected) => {
      console.log(`Collected ${collected.size} item(s)`);
      if (!embedHasBeenInteractedWith) {
        returnObject.status = 'timed-out';
        returnObject.video = undefined;
        resolve(returnObject);
      }

      removeCollector(collector);
    });
  });
}

module.exports = {searchAndReturnResult};
