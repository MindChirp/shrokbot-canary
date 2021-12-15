const {prefix, token} = require('../config.json');
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const queueHandler = require("../modules/queueHandler.js");
const playingHandler = require("../modules/nowHandler.js");

module.exports = {
    name: "stop",
    description: "Stops the music currently playing",
    async execute(message, args) {
        var vc = message.member.voice.channel;
        if(!vc) return message.channel.send("You need to be in a voice channel goddamnit!");


        //remove the queue database
        try {
            await queueHandler.deleteQueue(message.guild.id);
        } catch (error) {
            console.log(error);
        }

        //remove the queue database
        try {
            await playingHandler.deletePlaying(message.guild.id);
        } catch (error) {
            console.log(error);
        }

        await message.delete();
        await vc.leave();

   }
}