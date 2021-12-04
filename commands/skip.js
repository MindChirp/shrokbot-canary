const {prefix, token} = require('../config.json');
const { MessageEmbed } = require("discord.js")
const { dbHandler } = require("../modules/database/dbModule");
const path = require("path");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");

module.exports = {
    name: "skip",
    description: "Skips the current song",
    async execute(message, args) {


        try {
            var nowDb = await dbHandler.get(path.join(path.dirname(__dirname), "database", "playing"), "playing" + message.guild.id);
        } catch (error) {
            console.log(error);
            return;
        }


        try {
            var db = await dbHandler.get(path.join(path.dirname(__dirname), "database", "queue"), "queue" + message.guild.id);
        } catch (error) {
            console.log(error);
            return;
        }

        //Get the current song
        var now = await nowDb.SELECT("order", 0);
        playNextVideo(now[1]);
        
        async function playVideo(video) {
            if(video) {
                //Add this video object to the now playing database
                replaceNowPlayingData(video);


                async function playAudio() {
                    var vc = message.member.voice.channel;

                    var ch = message.channel.id;
                    //if(ch != 405738093421789194 && ch != 737346979922968598) return message.channel.send("Fuck off");

                    if(!vc) return message.channel.send("You need to be in a voice channel to listen to music!")
                    var perms = vc.permissionsFor(message.client.user);
                    if(!perms.has("CONNECT")) return message.channel.send("I don't have the sufficient permissions.");
                    if(!perms.has("SPEAK")) return message.channel.send("I don't have the sufficient permissions.");

                    var connection = await vc.join();

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
            var queue = await db.SELECT("*");
            if(queue[0].values.length > 0) {
                //If there is a queue
                //Delete the currently playing song from queue
                try {
                    await db.DELETE("video", nowPlaying[1])
                } catch (error) {
                    console.log(error);
                }

                try {
                    var video = await db.SELECT("*");
                    await nowDb.WIPE();
                    console.log("INSERTING INTO PLAYING DATABASE")
                    await nowDb.INSERT({username: message.author.username, video: video[1].values[0].value, place: 0}) 
                } catch (error) {
                    
                }
            } else {
                //If there isn't a queue

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
                    await vc.leave();
                }, 1000);
                return;
            }

            //Check if the queue length is 1, and that
            //the queued video is the one that just finished playing
            if(queue[0].values.length == 1 && queue[1].values[0].value == playedVideo || queue[0].values.length == 1 && !playedVideo) {
                //Do not continue
                //Clear the now playing
                await nowDb.WIPE();
                await db.WIPE();
                var vc = message.member.voice.channel;
                setTimeout(async ()=>{
                    await vc.leave();
                }, 1000);

                return;
            } else {
                //There is a queue, play the next one
                var now = await nowDb.SELECT("order", 0);
                try {
                    await db.DELETE("video", now[1]) //Delete the row with the currently playing video
                    //Get the next video
                    var video = await db.SELECT("*");
                    playVideo(video[1].values[0].value);

                } catch (error) {
                    console.log(error);
                }

            }

        }
    }
}