const {Events} = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`The application is up and running as ${client.user.tag}!`);
  },
};
