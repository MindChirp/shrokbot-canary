const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require('@discordjs/builders');
const {ButtonStyle} = require('discord.js');

/**
 * Creates an interactive embed
 *
 * @param {array} list A list of all the search results
 * @return {[EmbedBuilder, ActionRowBuilder]} A generated embed with buttons at the bottom
 */
function searchResults(list) {
  // Create a result list based on the provided list
  if (list.length == 0) {
    // Create a simple message
    const embed = new EmbedBuilder().setColor(0xe803fc).addFields({
      name: 'No results found.',
      value: 'Sorry! No results were found for the given query.',
    });

    return [embed];
  }

  let string = '';

  for (let i = 0; i < list.length; i++) {
    string += '\n' + (i + 1) + ': ' + list[i].title.slice(0, 40);
  }

  const embed = new EmbedBuilder().setColor(0xe803fc).addFields({
    name: 'Search results',
    value: string,
  });

  const row = new ActionRowBuilder();

  for (let i = 0; i < list.slice(0, 4).length; i++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(i + '')
        .setLabel(i + 1 + '')
        .setStyle(ButtonStyle.Primary)
    );
  }

  row.addComponents(
    new ButtonBuilder()
      .setCustomId('5')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Primary)
  );

  return [embed, row];
}

module.exports = {searchResults};
