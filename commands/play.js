const {prefix, token} = require('../config.json');
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "play",
    description: "Plays music from YouTube",
    async execute(message, args) {

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

        var video = await videoFinder(args.join(' '));
        playVideo(video)
        //Check if there are videos in queue


        //Check for queue
        /*
        if(queue[0].values.length < 2) { //If there is one in queue, that is the one that has just been added
            //There is no queue

            playVideo(video);
        } else {
            //There is a queue, don't play the video right away.



            var list = [];
            var objs = queue[1].values;
            var x;
            for(x of objs) {
                list.push(x);
            }

            //Create queue message
            var queueEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Your queue')

            var x;
            for(x of list) {
                queueEmbed.addField(x.value.title, x.value.timestamp);
            }

            message.channel.send(queueEmbed);
        }
        */


        async function playVideo(video) {
            if(video) {
                async function playAudio() {
                    var stream = ytdl(video.url, {filter:'audioonly'});
                    connection.play(stream, {seek: 0, volume: 1})
                    .on("finish", async ()=>{
                        //Check if the song should be looped
                        try {
                            var config = JSON.parse(await fs.readFile("./currentConfig.json", "utf8"));
                        } catch (error) {
                            message.channel.send("Fuck.");
                        }
        
                        if(config.loopSong) {
                            playAudio();
                        } else {

                            playNextVideo(video);

                            /*
                            //Leave the voicechannel when the video has been played
                            setTimeout(()=>{
                                vc.leave();
                            }, 10000);
                            */


                        }
                    })
                }

                playAudio();


                await message.channel.send(`:clap: Now playing ***` + video.title + `***`);
            } else {
                message.channel.send("No videos were found.");
            }
        }

    }
}

function playSongStream() {
    
}