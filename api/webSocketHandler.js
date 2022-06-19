const databaseHandler = require("./database");
const { interperetQuery } = require("./websocketActions");

function handleWebSocketCommunication(ws) {
    if(!ws) return;
    
    ws.on("message", async (message)=>{
        var valid = await checkIfValidSocket(ws, message); //Automatically warns client that they are not authorized
        console.log(valid)
        if(!valid) return;

        var authorized = false;
        if(ws.guildToken) {authorized = true;}

        //Do some handling with the communication or something, i dunno
        try {
            var qry = JSON.parse(message);
        } catch (error) {
            console.error(error);
        }

        

        interperetQuery(qry, ws);

    });

    ws.on("close", function(){
        //Do something..?
    })
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

            dat = dat || {guildToken: undefined, userId: undefined};

            if(!dat.guildToken || dat.userId) {
                sendUnauthorizedWarning(ws);
                resolve(false);
            }

            var guildToken = dat.guildToken;
            //Check if this token exists in the database
            databaseHandler.checkForGuildId(guildToken)
            .then(res=>{
                ws.guildToken = dat.guildToken;
                ws.userId = dat.userId;
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
            resolve(true);
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