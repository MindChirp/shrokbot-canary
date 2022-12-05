/**
 * Party trick 3 is a trick that bullies a friend of mine,
 * Behrens, every time he uses bot commands
 * @param {interaction} interaction The chat interaction object
 * @return {boolean} If the user is behrens or not
 */
async function partyTrick3(interaction) {
  const messageList = [
    'Would you like some tea and biscuits as well, sir?',
    'One Mariekjeks coming up, good sir!',
    "Some fish'n chips as well?",
  ];
  const userId = '384105277609213952';
  const user = interaction.member;

  if (userId != user.id) return false;

  const number = Math.round(Math.random() * messageList.length);
  await interaction.channel.send(messageList[number]);

  return true;
}

module.exports = {partyTrick3};
