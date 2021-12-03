const {prefix, token} = require('../config.json');
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs-extra");
const { dbHandler } = require("../modules/database/dbModule");
const path = require("path");

module.exports = {
    name: "stop",
    description: "Stops the music currently playing",
    async execute(message, args) {
        var vc = message.member.voice.channel;
        if(!vc) return message.channel.send("You need to be in a voice channel goddamnit!");

        //Clear the database
        //var db = await dbHandler.get(path.join(path.dirname(__dirname), "database", "queue"), "queue" + message.guild.id);
        try {
            await dbHandler.drop(path.join(path.dirname(__dirname), "database", "queue"), "queue" + message.guild.id);
        } catch (error) {
            console.log(error);
        }


        try {
            var nowDb = await dbHandler.get(path.join(path.dirname(__dirname), "database", "playing"), "playing" + message.guild.id);
            await nowDb.WIPE();
        } catch (error) {
            console.log(error);
        }

        try {
            await vc.leave();
        } catch (error) {
            console.log(error);
        }
    }
}