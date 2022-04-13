const {prefix, token} = require('../config.json');
//const checkForApiKey = require('../api/api.js').checkForApiKey;
const { checkForApiKey } = require('../api/database');
const mongoose = require("mongoose");
const { v4: uuidv4, v4 } = require('uuid');
const Server = require("../api/api-models").Server;


const pass = "0zwG5ZbB1VCf3xBa";
mongoose.connect(`mongodb+srv://shrokbot:${pass}@shrokbot.omeyr.mongodb.net/shrokbot?retryWrites=true&w=majority`, {useNewUrlParser: true});
mongoose.connection
.once("open", ()=>{console.log("Database connected")})
.on("error", (error)=>{
    console.log(error);
})

module.exports = {
    name: "clienttoken",
    description: "Generates a client token",
    async execute(message, args) {
        //message.channel.send("This function is under development!");
        
        var guildId = message.guild.id;

        if(mongoose.connection.readyState != 1) {console.log("Database not connected"); return;}
        if(!guildId) reject("No guild id provided");
        //if(mongoose.connection.readyState != 1) reject("Database not connected");
        
        //Search the mongoose database
        var keys = await Server.find({guildId:guildId.toString()});
        if(keys.length > 0) {message.channel.send(":warning: A client token has already been generated for this server."); return;};

        //Generate uuid
        var id = v4();
        //Write to server
        var tokenPair = new Server({guildId: guildId, guildToken: id});
        tokenPair.save()
        .then(()=>{
            message.channel.send(":white_check_mark: Here's your client token: `" + id + "`");
        })
        .catch(err=>{
            console.log(err);
            message.channel.send("Sorry, I could not generate your token.");
        });






/*         checkForApiKey(guildId)
        .then((res)=>{
            console.log("No token generated for this server");
            message.channel.send(":white_check_mark: Here's your client token: `" + res + "`");
        })
        .catch(err=>{
            if(err == "Key already exists") {
                message.channel.send(":warning: A client token has already been generated for this server.")
            }
        });  */
    
    }
}