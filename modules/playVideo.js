const queueHandler = require("../modules/queueHandler.js");
const ytSearch = require("yt-search");
const playingHandler = require("../modules/nowHandler.js");
const { MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const { sendSocketPlayStatus } = require("../api/transmitter.js");

async function playVideo({video, connection, ytdl1 /*Not in use*/, message, config, guildId}) {
    return new Promise(async(resolve,reject)=>{
        const { client } = require("../botStart");

        if(video) {
            async function playAudio() {
                var stream = ytdl(video.url, {filter:'audioonly'});
                connection.play(stream, {seek: config.seek||0, volume: 1})
                .on("finish", async ()=>{
                    if(!message && !guildId) {
                        //Return promise as resolved

                        resolve();
                    } else {
                        playNextVideo({video:video, message:message, connection:connection, ytdl:ytdl, guildId: guildId});
                    }
                })

                //Send a message to every socket belonging to this guild, informing
                //of what song is being played
                if(guildId){
                    console.log("UR MOMMA", video, guildId);
                    sendSocketPlayStatus(video, guildId);
                }

                
            }

            playAudio();

            if(config.seek > 0) {
            } else {
                if(!message) return;
                //Send embed
                
                video.title = video.title || "Unknown";
                video.url = video.url || "Unknown";
                video.image = video.image || undefined;
                video.author = video.author || {name: "Unknown"};
                video.timestamp = video.timestamp || "Unknown";
                var embed = new MessageEmbed()
                .setAuthor("Now playing", client.client.user.displayAvatarURL())
                .setColor("#ffff00")
                .setTitle(video.title)
                .setURL(video.url)
                .setThumbnail(video.image)
                .addFields(
                    {name: "Channel", value: video.author.name, inline: true},
                    {name: "Length", value: video.timestamp, inline: true}
                )
                await message.channel.send(embed);
                //await message.channel.send(`:clap: Now playing ***` + video.title + `***`);
            }
        } else {
            if(!message) return;
            message.channel.send("No videos were found.");
            
        }
    })

}

async function playNextVideo({video, connection, ytdl, message, guildId}) {
    //video is the currently playing video
    //Remove the current video from queue
    try {
        await queueHandler.deleteFromQueue(message.guild.id, 0);       
    } catch (error) {
        console.log(error);
    }

    //Get new queue
    try {
        var queue = await queueHandler.fetchQueue(message.guild.id);
    } catch (error) {
        if(!message) return;
        console.log(error);
        message.channel.send("Could not play next video.");
        return;
    }
    queue = queue || {entries: [], guildId: undefined};

    if(queue.entries.length == 0) {
        //Inform all clients

        if(guildId) {
            sendSocketPlayStatus(undefined, guildId);
        }

        if(!message) return;
        //There is no queue 
        var vc = message.member.voice.channel;
        vc.leave();
        message.channel.send("No more songs to play.");
        return;
    } else if(queue.entries.length > 0) {
        //Play the next video
        playVideo({video: queue.entries[0].video, connection: connection, ytdl: ytdl, message: message, config:{}, guildId: guildId});
    }
}

module.exports = { playVideo, playNextVideo };