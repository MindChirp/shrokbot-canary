const ytSearch = require("yt-search");
const { MessageEmbed, VoiceChannel } = require("discord.js");
const { playVideo } = require("../modules/playVideo.js");
const queueHandler = require("../modules/queueHandler.js");
const getSongs = require("../modules/geniusInteractor.js");
const ytdl = require("ytdl-core");


module.exports = {
    name: "song",
    description: "Plays random song, either from artist, or from anyone",
    async execute(message, args) {
        if(args.length == 0) {
            var ind = 0;
            function getRandom() {
                getSongs.getRandom()
                .then(async res=>{
                    var data = JSON.parse(res);
                    if(!data.response.song.full_title) {message.channel.send("ERROR"); return;}

                    //play this song
                    var videoFinder = async(query)=>{
                        var videoResult = await ytSearch(query);
                        return (videoResult.videos.length > 1)?videoResult.videos[0]:null;
                    }
                    var vc = message.member.voice.channel;
                    var connection = await vc.join();

                    try {
                        var video = await videoFinder(data.response.song.full_title)
                    } catch (error) {
                        console.log(error);
                    }

                    playVideo({video:video, connection:connection, ytdl: ytdl, message:message, config:{}})

                })
                .catch(err=>{
                    if(ind > 5) {
                        ind = 0;
                        message.channel.send("Could not fetch a song.");
                        console.log(err);
                    } else {
                        getRandom();
                        ind++;
                    }
                })
            }

            getRandom();

        } else {
            getSongs.getByArtist(args)
            .then(async res=>{
                var data = res;
                if(!data.full_title) {message.channel.send("ERROR"); return;}

                //play this song
                var videoFinder = async(query)=>{
                    var videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1)?videoResult.videos[0]:null;
                }
                var vc = message.member.voice.channel;
                var connection = await vc.join();

                try {
                    var video = await videoFinder(data.full_title)
                } catch (error) {
                    console.log(error);
                }

                playVideo({video:video, connection:connection, ytdl: ytdl, message:message, config:{}})

            })
            .catch(err=>{
                message.channel.send("Could not find the artist.");
            })
        }
    }
}