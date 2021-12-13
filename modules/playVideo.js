const playingHandler = require("../modules/nowHandler.js");
async function playVideo({video, connection, ytdl, message}) {
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
                    //If the song is not being looped, play the next video, or disconnect the bot
                    playNextVideo(video);
                }
            })



            //Insert the currently playing video
            try {
                await playingHandler.insertToPlaying(message.guild.id, video, message.member.user);
            } catch (error) {
                console.log(error);                            
            }

            
        }

        playAudio();


        await message.channel.send(`:clap: Now playing ***` + video.title + `***`);
    } else {
        message.channel.send("No videos were found.");
    }
}

function playNextVideo() {}

module.exports = { playVideo };