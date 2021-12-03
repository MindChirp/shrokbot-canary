const {prefix, token} = require('../config.json');
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const fs = require("fs-extra");
const { dbHandler } = require("../modules/database/dbModule");
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

        //Check if there are videos in queue
        

        //Get the queue database
        try {
            var db = await dbHandler.get(path.join(path.dirname(__dirname), "database", "queue"), "queue" + message.guild.id);
        } catch (error) {
            try {
                //Does not exist
                var db = await dbHandler.create("queue" + message.guild.id, path.join(path.dirname(__dirname), "database", "queue"));
                await db.CREATE("username", "string");
                await db.CREATE("video", "object");
                await db.CREATE("place", "number");
            } catch (error) {
                message.channel.send("Sorry, your request couldn't be fulfilled.");
                return;
            }
        }

        try {
            var nowDb = await dbHandler.get(path.join(path.dirname(__dirname), "database", "playing"), "playing" + message.guild.id);
        } catch (error) {
            //Does not exist
            try {
                var nowDb = await dbHandler.create("playing" + message.guild.id, path.join(path.dirname(__dirname), "database", "playing"));
                await nowDb.CREATE("username", "string");
                await nowDb.CREATE("video", "object");
                await nowDb.CREATE("order", "number");
            } catch (error) {
                console.log(error);
                message.channel.send("Could not load song.");
                return;
            }
        }


        await db.INSERT({username: message.author.username, video: video, place: 0});

        //Check for queue
        var queue = await db.SELECT("*");
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


        async function playVideo(video) {
            if(video) {
                //Add this video object to the now playing database
                replaceNowPlayingData(video);


                function playAudio() {
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


        async function replaceNowPlayingData(video) {
            //Replace the currently playing video with a new one
            //Remove the old video from queue list
            
            //Get the currently playing video
            var nowPlaying = await nowDb.SELECT("order", 0);
            if(!(nowPlaying.length < 1)) {
                try {
                    await nowDb.WIPE();
                } catch (error) {
                    console.log(error);
                }

                try {
                    await nowDb.INSERT({username: message.author.username, video: video, order: 0});
                } catch (error) {
                    console.log(error);
                }
            } else {
                try {
                    await nowDb.INSERT({username: message.author.username, video: video, order: 0});
                } catch (error) {
                    console.log(error);
                }
            }

        }

        async function playNextVideo(playedVideo) {
            //Play the next video, and kill the old one
            //Fetch the queue, is there something more?
            try {
                var queue = await db.SELECT("*");
            } catch (error) {
                //No queue
                setTimeout(()=>{
                    vc.leave();
                }, 1000);
                return;
            }
            if(queue[0].values.length < 1) {
                //Do not continue
                //Clear the now playing
                await nowDb.WIPE();
                await db.WIPE();
                setTimeout(()=>{
                    vc.leave();
                }, 1000);
                return;
            } else {
                //There is a queue, play the next one
                var now = await nowDb.SELECT("order", 0);
                try {
                    await db.DELETE("video", now[1]) //Delete the row with the currently playing video
                } catch (error) {
                    console.log(error);
                }

            }

        }

    }
}

function playSongStream() {
    
}