const queueHandler = require("../modules/queueHandler.js");
const ytSearch = require("yt-search");
const playingHandler = require("../modules/nowHandler.js");
async function playVideo({video, connection, ytdl, message, config}) {
    if(video) {
        async function playAudio() {
            var stream = ytdl(video.url, {filter:'audioonly'});
            console.log(config.seek)
            connection.play(stream, {seek: config.seek||0, volume: 1})
            .on("finish", async ()=>{
                playNextVideo({video:video, message:message, connection:connection, ytdl:ytdl});
            })

            



            //Insert the currently playing video
            try {
                await playingHandler.insertToPlaying(message.guild.id, video, message.member.user);
            } catch (error) {
                console.log(error);                            
            }

            
        }

        playAudio();

        if(config.seek > 0) {
        } else {
            await message.channel.send(`:clap: Now playing ***` + video.title + `***`);
        }
    } else {
        message.channel.send("No videos were found.");
    }
}

async function playNextVideo({video, connection, ytdl, message}) {
    //video is the currently playing video
    //Remove the current video from queue
    try {
        await queueHandler.deleteFromQueue({guildId: message.guild.id, video: video})       
    } catch (error) {
        console.log(error);
    }

    //Get new queue
    try {
        var queue = await queueHandler.queueExists(message.guild.id);
    } catch (error) {
        console.log(error);
        message.channel.send("Could not play next video.");
        return;
    }

    if(queue == false) {
        //There is no queue 
        var vc = message.member.voice.channel;
        vc.leave();
        message.channel.send("No more songs to play.");
        return;
    } else if(queue[1].queueEntries.length == 0) {
        var vc = message.member.voice.channel;
        vc.leave();
        message.channel.send("No more songs to play.");
        return;
    } else if(queue[1].queueEntries.length > 0) {
        //Play the next video
        playVideo({video: queue[1].queueEntries[0].video, connection: connection, ytdl: ytdl, message: message, config:{}});
    }
}

module.exports = { playVideo, playNextVideo };