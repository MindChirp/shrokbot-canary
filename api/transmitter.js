const databaseHandler = require("./database");

async function sendSocketPlayStatus(video, guildId) {
    const { webSocketServer } = require("./api"); //It is probably a bad practice to require for every time the function runs, but had to be done to prevent circular dependencies
    
    //Get guild token of guild id
    try {
        var guildToken = await databaseHandler.checkForApiKey(guildId);
    } catch (error) {
        console.error(error);
        return;
    }

    //Get all sockets
    var sckts = webSocketServer.wss.clients;
    sckts.forEach(element => {
        console.log(element.guildToken, guildToken);
        if(element.guildToken == guildToken) {
            //This socket should receive the update
            var obj = {
                header: "NOW-PLAYING",
                body: video
            }
            element.send(JSON.stringify(obj));
        }
    });
}


module.exports = { sendSocketPlayStatus };
