const { playNextVideo } = require("../modules/playVideo");
const databaseHandler = require("./database");
const queueHandler = require("../modules/queueHandler");
const ytdl = require("ytdl-core")
async function interperetQuery(query, socket) {
    if(query.header == "CLIENT-CATCHUP") {
        //The client has probably just connected, and wants to be informed of everything going on

        //Send the client every piece of useful information

        //Fetch the guild id
        try {
            var id = await databaseHandler.checkForGuildId(socket.guildToken);
        } catch (error) {
            console.error(error);
            return;
        }

        if(!id) {socket.send(JSON.stringify({
            header: "ERROR",
            body: "Could not find a guild entry in the database"
        }));
            console.log("NO ID FOUND");
            return;
        }
        
        try {
            console.log("ID: ", id);
            var queue = await databaseHandler.getGuildQueue(id);
        } catch (error) {
            console.error(error);   
        }

        var obj = {
            header: "CLIENT-CATCHUP",
            body: {
                queue: queue
            }
        }

        socket.send(JSON.stringify(obj));

    } else if(query.header == "PLAYBACK-CONTROLS") {
        //Handle playback controls like skipping
        var action = query.body.action;

        switch(action) {
            case "SKIP":
                skipSong(socket);
            break;
        }
    }
}



async function skipSong(socket) {
    //Get the current video

    //Get the guild id
    try {
        var guildId = await databaseHandler.checkForGuildId(socket.guildToken);
    } catch (error) {
        console.error(error);
        return;
    }
    try {
        var now = await queueHandler.fetchQueue(guildId);
    } catch (error) {
        console.error(error);
        return;
    }

    now = now || {entries: [], guildId: guildId};
    console.log(now);
    if(now.entries.length == 0) {
        socket.send(JSON.stringify({
            header: "ACTION-RESPONSE",
            body: "There was nothing to skip"
        }));
        return;
    } else if(now.entries.length > 0) {
        //CHECKPOINT
        var client = require("../client").client;
        var Guild = client.guilds.cache.get(guildId);
        var member = await Guild.members.cache.get(socket.userId);
        if(member.voice.channel) {
            var connection = await member.voice.channel.join();
            playNextVideo({video: now.entries[0].video, connection: connection, ytdl: ytdl, message: undefined, guildId: guildId});
        }
    }

}

module.exports =  { interperetQuery };