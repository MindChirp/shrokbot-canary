const {prefix, token} = require('../config.json');
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { MessageEmbed } = require("discord.js");
const queueHandler = require("../modules/queueHandler.js");
const playingHandler = require("../modules/nowHandler.js");
const { playVideo } = require("../modules/playVideo.js");


module.exports = {
    name: "play",
    description: "Plays music from YouTube",
    async execute(message, args) {
        try {
            var queue = await queueHandler.queueExists(message.guild.id);
        } catch (error) {
            
        }

        var vc = message.member.voice.channel;

        var ch = message.channel.id;
        //if(ch != 405738093421789194 && ch != 737346979922968598) return message.channel.send("Fuck off");

        if(!vc) return message.channel.send("You need to be in a voice channel to listen to music!")
        var perms = vc.permissionsFor(message.client.user);
        if(!perms.has("CONNECT")) return message.channel.send("I don't have the sufficient permissions.");
        if(!perms.has("SPEAK")) return message.channel.send("I don't have the sufficient permissions.");

        if(!args.length) {
            return message.channel.send("Specify a link as well!");
        }

        var connection = await vc.join();
        

        var videoFinder = async(query)=>{
            var videoResult = await ytSearch(query);
            return (videoResult.videos.length > 1)?videoResult.videos[0]:null;
        }

        //Get the video
        //Try to remove playlist link
        var part = [args[0].toString().split("&list")[0]];
        try {
            var video = await videoFinder(part.join(' '));
        } catch (error) {
            console.log(error)
        }
        //Check if there are videos in queue
        if(queue == false || queue[1].queueEntries.length == 0) {
            //No queue exists
            //Add video to queue
            try {
                await queueHandler.insertToQueue(message.guild.id, video, message.member.user);
            } catch (error) {
                console.log(error);
            }
            //No queue
            playVideo({video:video, connection:connection, ytdl:ytdl, message:message, config: {}});
        } else if(queue[0] == true && queue[1].queueEntries.length > 0) {
            //There is a queue
            //Add the new video
            try {
                await queueHandler.insertToQueue(message.guild.id, video, message.member.user);
            } catch (error) {
                console.log(error);
                message.channel.send("Sorry, I could not add that video to the queue list.");
                return;
            }



            //Refresh the queue
            try {
                var queue = await queueHandler.queueExists(message.guild.id);
            } catch (error) {
                console.log("Could not refresh queue");                
            }


            //Create added to queue message
            var queueEmbed = new MessageEmbed()
                .setAuthor("Added to queue", "https://cdn.discordapp.com/avatars/" + message.member.user.id + "/" + message.member.user.avatar + ".webp")
                .setColor('#0099ff')
                .setTitle(video.title)
                .setURL(video.url)
                .setThumbnail(video.image)
                .addFields(
                    {name: "Channel", value: video.author.name, inline:true},
                    {name: "Length", value: video.timestamp, inline:true},
                    {name: "Estimated time until playing", value: "Ur mom", inline: true},
                    {name: "Position in queue", value: queue[1].queueEntries.length, inline:false}
                )

            message.channel.send(queueEmbed);
        }
    }
}