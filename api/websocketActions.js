const databaseHandler = require("./database");

async function interperetQuery(query, socket) {
    console.log(query);
    if(query.header == "CLIENT-CATCHUP") {
        console.log("aiusbdaiusd")
        //The client has probably just connected, and wants to be informed of everything going on

        //Send the client every piece of useful information

        //Fetch the guild id
        try {
            var id = await databaseHandler.checkForApiKey(socket.guildToken);
            console.log(id);
        } catch (error) {
            console.error(error);
            return;
        }
        
        try {
            var nowPlaying = await databaseHandler.getGuildQueue(id);
        } catch (error) {
            console.error(error);   
        }

        console.log(nowPlaying);

        var obj = {
            header: "CLIENT-CATCHUP",
            body: {
                //nowPlaying: 
            }
        }

    } else if(query.header == "???") {
        //???
    }
}

module.exports =  { interperetQuery };