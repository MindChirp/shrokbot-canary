const { playVideo } = require("../modules/playVideo.js");
const playingHandler = require("../modules/nowHandler.js");
const ytdl = require("ytdl-core");

module.exports = {
    name: "seek",
    description: "Seek through the music",
    async execute(message, args) {
        //Get the current video
        try {
            var playing = await playingHandler.nowExists(message.guild.id);
        } catch (error) {
            console.log(error);
            message.channel.send("Could not seek.");
            return;
        }

        if(playing == false || playing[1].playing.length == 0) {
            message.channel.send("There is no currently playing song!");
            return;
        } else if(playing[1].playing.length > 0) {
            //There is a song playing
            var nowPlaying = playing[1].playing[0];
            var vc = message.member.voice.channel;
            var connection = await vc.join();

            //Convert the args into a timestamp
            //Check if string contains no letters

            playVideo({video: nowPlaying.video, connection: connection, ytdl: ytdl, message: message, config: {
                seek: timestamp
            }})
        }
    }
}