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
        if(ch != 405738093421789194 && ch != 737346979922968598) return message.channel.send("Fuck off");

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
        var video = await videoFinder(args.join(' '));
        
        //Check if there are videos in queue
        if(queue == false) {

            //Add video to queue
            try {
                await queueHandler.insertToQueue(message.guild.id, video, message.member.user);
            } catch (error) {
                console.log(error);
            }
            //No queue
            playVideo({video:video, connection:connection, ytdl:ytdl, message:message});
        } else if(queue[0] == true) {


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


            var list = [];
            var objs = queue[1].queueEntries;

            for(let i = 0; i < objs.length; i++) {
                list.push(objs[i]);
            }

            //Create queue message
            var queueEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Your queue')

            var x;
            for(x of list) {
                queueEmbed.addField(x.video.title, x.video.timestamp + " | Requested by " + x.user.username);
            }

            message.channel.send(queueEmbed);
        
        }
    }
}