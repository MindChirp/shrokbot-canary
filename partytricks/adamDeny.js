/**
 * Party trick 1 is a trick that denies a certain user access
 * to the commands 25% percent of the time, instead sending a
 * custom message
 *
 * @param {interaction} interaction The chat interaction object
 * @return {boolean} If the party trick was fulfilled or not
 * @author Frikk O. Larsen
 * @version 1.0.0
 */
function partyTrick1(interaction) {
  const customMessage = 'Shut the fuck up, Adam';
  const userId = '200147738485063680';
  const occurencePercentage = 25;

  // First off, check if the intercation user is a specific person
  const user = interaction.member;
  if (user.id == userId) {
    // Check if Adam should be trolled
    const rand = Math.random();

    if (rand <= occurencePercentage / 100) {
      // Troll adam 25 % of the time
      interaction.reply(customMessage);
      return true;
    }

    return false;
  }
}

module.exports = {partyTrick1};
