const {EmbedBuilder} = require('@discordjs/builders');

/**
 *
 * @param {Object} video A video object containing all relevant data
 * @param {Client} client The discord bot client
 * @return {EmbedBuilder} The generated now playing embed
 */
function nowPlayingEmbed(video, client) {
  const embed = new EmbedBuilder()
    .setColor(0xe803fc)
    .setAuthor({
      name: 'Now playing',
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

module.exports = {nowPlayingEmbed};
