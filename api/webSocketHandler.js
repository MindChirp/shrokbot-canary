const databaseHandler = require("./database");

function handleWebSocketCommunication(ws) {
    if(!ws) return;
    
    ws.on("message", async (message)=>{
        var valid = await checkIfValidSocket(ws, message); //Automatically warns client that they are not authorized
        console.log("VALID?: " + valid)
        if(!valid) return;

        var authorized = false;
        if(ws.guildToken) {authorized = true;}

        //Do some handling with the communication or something, i dunno
        

    });
}


function checkIfValidSocket(ws, message) {
    return new Promise((resolve, reject)=>{

        if(!ws.guildToken) {

            if(!message) {sendUnauthorizedWarning(ws); return;}
            //We expect this message to contain a guild token, with the following format
            /*
                {
                    guildToken: "blablabla"
                }
            
            */
            try {
                var dat = JSON.parse(message);
            } catch (error) {
                console.log(error);
                //This is not a valid message!
                sendUnauthorizedWarning(ws);
                resolve(false);
            }

            dat = dat || {guildToken: undefined};

            if(!dat.guildToken) {
                sendUnauthorizedWarning(ws);
                resolve(false);
            }

            var guildToken = dat.guildToken;
            //Check if this token exists in the database
            databaseHandler.checkForGuildId(guildToken)
            .then(res=>{
                console.log("YESYESYES")
                ws.guildToken = dat.guildToken;
                var obj = {
                    status: 200,
                    message: "You are now authorized, and associated to a proper guild token",
                    authorized: true
                }
                ws.send(JSON.stringify(obj))
                resolve(true);
            })
            .catch(err=>{
                console.log(err);
                sendUnauthorizedWarning(ws);
                resolve(false);
            })

        } else {
            return true;
        }
    }) 

}


function sendUnauthorizedWarning(ws) {
    if(!ws) return;
    var obj = {
        status: 401,
        message: "A guild token is required, and your connection has not been associated with one. Please provide one in the next request",
        authorized: false
    }

    ws.send(JSON.stringify(obj));
}

module.exports = { handleWebSocketCommunication };