const {EmbedBuilder} = require('@discordjs/builders');

/**
 *
 * @param {Object} video A video object containing all relevant data
 * @param {Client} client The discord bot client
 * @return {EmbedBuilder} The generated now playing embed
 */
function addedToQueueEmbed(video, client) {
  const embed = new EmbedBuilder()
    .setColor(0xe803fc)
    .setAuthor({
      name: 'Added to queue',
      iconURL: client.user.displayAvatarURL(),
      url: video.url,
    })
    .setTitle(video.title)
    .setThumbnail(video.image)

    .addFields(
      {name: 'Channel', value: video.author.name, inline: true},
      {name: 'Length', value: video.timestamp, inline: true}
    );

  return embed;
}

/**
 * Generate a queue embed for any given playlist
 *
 * @param {object} playlist A playlist object
 * @param {*} client The bot client
 * @return {EmbedBuilder} The generated queue embed
 */
function playlistAddedToQueueEmbed(playlist, client) {
  const embed = new EmbedBuilder()
    .setColor(0xe803fc)
    .setAuthor({
      name: 'Playlist added to queue',
      iconURL: client.user.displayAvatarURL(),
      url: playlist.url,
    })
    .setTitle(playlist.title)
    .setThumbnail(playlist.thumbnail)

    .addFields(
      {name: 'Author', value: playlist.author.name, inline: true},
      {name: 'Length', value: playlist.videos.length + ' videos', inline: true}
    );

  return embed;
}
module.exports = {addedToQueueEmbed, playlistAddedToQueueEmbed};
