const {prefix, token} = require('../config.json');
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "help",
    description: "Gives you help",
    execute(message, args) {

        var embed = new MessageEmbed()
            .setTitle("All commands")
            .setColor("#34eb64")
            .addFields(
                {name: prefix + "play", value:"Plays a desired song from youtube"},
                {name: prefix + "skip", value:"Skips the currently playing song, if there is one"},
                {name: prefix + "remove",value:"Removed a song from the queue based on its index"},
                {name: prefix + "seek",value:"Seeks to a point in the currently playing video"},
                {name: prefix + "topic",value:"Gives you a random topic to talk about"},
                {name: prefix + "addtopic",value:"Add a topic to the topics list"},
                {name: prefix + "banword",value:"Add a word to the addtopic ban filter"},
                {name: prefix + "donkey",value:"Fun for the whole family"},
                {name: prefix + "siwallah",value:"wollaaaaaah"},
                {name: prefix + "rick",value:"You know what this is."},
                {name: prefix + "song",value:"Play either a random song, or add an artist name to play a random song from that artist. `BETA`."}
            )

            message.channel.send(embed);
/*
        message.channel.send("```**Complete list of commands** \n "
                             + prefix + "topic - gives you a random topic \n "
                             + prefix + "addtopic - adds a topic to the topic list \n "
                             + prefix + "banword - bans a word (or a word / sentence similar to it) from being added to the topic list \n "
                             + prefix + "donkey - DONKEEEEY \n "
                             + prefix + "siwallah - wallaaaah \n "
                             + prefix + "rick - Never gonna give you up```");
*/
    }
}
