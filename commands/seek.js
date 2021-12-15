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
            console.log(playing[1].playing)
            //There is a song playing
            var nowPlaying = playing[1].playing[0];
            var vc = message.member.voice.channel;
            var connection = await vc.join();

            //Convert the args into a timestamp
            //Check if string contains no letters
            var spl = args.toString().split(":");
            if(spl.length < 2) {
                message.channel.send("Incorrect format. Try something like this - `2:10` or `1:0:10`");
                return;
            }

            //Convert to seconds
            var tot;
            switch(spl.length) {
                case 2:
                    var s1 = parseInt(spl[0])*60;
                    var s2 = parseInt(spl[1]);
                    tot = s1+s2;
                break;
                case 3:
                    var s1 = parseInt(spl[0])*60*60;
                    var s2 = parseInt(spl[1])*60;
                    var s3 = parseInt(spl[2]);
                    tot = s1+s2+s3;
                break;
            }


            playVideo({video: nowPlaying.video, connection: connection, ytdl: ytdl, message: message, config: {
                seek: parseInt(tot)
            }})

            message.channel.send("Seeking to `" + args + "`");
        }
    }
}