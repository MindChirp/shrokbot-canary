const {prefix, token} = require('../config.json');
const { MessageEmbed } = require("discord.js")
const path = require("path");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const { playNextVideo, playVideo } = require("../modules/playVideo.js");
const playingHandler = require("../modules/nowHandler.js");
const queueHandler = require("../modules/queueHandler.js");


module.exports = {
    name: "skip",
    description: "Skips the current song",
    async execute(message, args) {
        //Get the current video
        try {
            var now = await queueHandler.fetchQueue(message.guild.id);
        } catch (error) {
            message.channel.send("Could not skip.");
            return;
        }

        now = now || {entries: [], guildId: message.guild.id};

        if(now.entries.length == 0) {
            message.channel.send("Nothing to skip.");
            return;
        } else if(now.entries.length > 0) {
            var vc = message.member.voice.channel;
            var connection = await vc.join();
            playNextVideo({video: now.entries[0].video, connection: connection, ytdl: ytdl, message: message});
        }
    }
}