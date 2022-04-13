const queueHandler = require("../modules/queueHandler.js");
const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const { playVideo } = require("../modules/playVideo.js");
const ytdl = require("ytdl-core");

async function playVideoFromUrl(url, title, guildId) {
    if(!guildId) return;
    //Goal:
    /*
        1 - check if there is a queue
        2 - if there is none,
            *Fetch the currently active voice channel in the guild
            *Play the video from the provided url
            *Don't send a message in any text channel (we don't have one provided)
        3 - If there is a queue,
            *Add title and url to the queue of the guild in question

    */

    try {
        var queue = await queueHandler.queueExists(guildId);
    } catch (error) {
        console.error(error);
    }

    queue = queue || {entries: [], guildId: guildId}

    if(queue.entries.length == 0) {
        //No queue
        
    } else {

    }

}

module.exports = { playVideoFromUrl }