

function sendSocketPlayStatus(video, guildId) {
    if(!video) return;
    const { webSocketServer } = require("./api"); //It is probably a bad practice to require for every time the function runs, but had to be done to prevent circular dependencies
    
    //Get all sockets
    var sckts = webSocketServer.wss.clients;
    
    sckts.forEach(element => {
        if(element.guildId == guildId) {
            //This socket should receive the update
            element.send(JSON.stringify(video));
        }
    });
}


module.exports = { sendSocketPlayStatus };
