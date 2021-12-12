const {prefix, token} = require('../config.json');
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    name: "stop",
    description: "Stops the music currently playing",
    async execute(message, args) {
        var vc = message.member.voice.channel;
        if(!vc) return message.channel.send("You need to be in a voice channel goddamnit!");
   }
}