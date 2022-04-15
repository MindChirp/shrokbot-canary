const queueHandler = require("../modules/queueHandler.js");
const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const { playVideo } = require("../modules/playVideo.js");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

/*
    WARNING:
    It might be possible that the following declaration won't be updated
    when for instance a new server is added to the client's guild list.
    Therefore, this is potentially a flaw in the system, but time will
    tell.
*/
/**/

async function videoFinder(query){
    var videoResult = await ytSearch(query);
    return (videoResult.videos.length > 1)?videoResult.videos[0]:null;
}


async function playVideoFromUrl(url, title, guildId) {
    return new Promise(async (resolve, reject)=>{

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
            var queue = await queueHandler.fetchQueue(guildId);
        } catch (error) {
            console.error(error);
        }

        queue = queue || {entries: [], guildId: guildId}

        if(queue.entries.length == 0) {
            //No queue
            
            //Check if the bot is connected to a voice chat in the server
            var { client } = require("../botStart");
            client = client.client;
            var guild = client.guilds.cache.get(guildId);
            try {
                var voiceChannels = guild.voice || undefined;
            } catch (error) {
                reject("The bot is not connected to a voice channel");
                return;
            }
            if(!voiceChannels) {
                reject("The bot is not connected to a voice channel");
                return;
            }
            
            if(!guild.voice) {reject("The bot is not connected to a voice channel"); return;}
            var channelId = guild.voice.channelID || undefined;
            
            if(!channelId) {reject("The bot is not connected to a voice channel"); return;};

            var vc = client.channels.cache.get(channelId);
            const connection = await vc.join();

            //Search for the url, and add it to the queue as a video object
            videoFinder(url)
            .then(res=>{
                console.log(res);
            })
            


            //Play the video directly
            playVideo({video: {url: url}, connection: connection, config: {}})
            .then((res)=>{
                console.log(res);
            })
            .catch((err)=>{            
                console.log(err);
            })
        } else {
            //Add to queue
            videoFinder(url)
            .then(res=>{
                //Add the result to the queue
                saveToQueue(res);
            })


            function saveToQueue(video) {
                queueHandler.insertToQueue(guildId, video, "Shrokbot client")
                .then(res=>{
                    console.log(res);
                    resolve(res);
                })
                .catch(err=>{
                    reject(err);
                })
            }

        }
    })

}

module.exports = { playVideoFromUrl }