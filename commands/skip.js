const {prefix, token} = require('../config.json');
const { MessageEmbed } = require("discord.js")
const path = require("path");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const { playNextVideo, playVideo } = require("../modules/playVideo.js");
const playingHandler = require("../modules/nowHandler.js");

module.exports = {
    name: "skip",
    description: "Skips the current song",
    async execute(message, args) {
        //Get the current video
        try {
            var now = await playingHandler.nowExists(message.guild.id);
        } catch (error) {
            message.channel.send("Could not skip.");
            return;
        }

        if(now == false) {
            message.channel.send("Nothing to skip.");
            return;
        } else if(now[0] == true) {
            var vc = message.member.voice.channel;
            var connection = await vc.join();
            playNextVideo({video: now[1].playing[0].video, connection: connection, ytdl: ytdl, message: message});
        }
    }
}