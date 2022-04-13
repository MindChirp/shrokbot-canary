const mongoose = require("mongoose");
const Server = require("./api-models").Server;

const pass = "0zwG5ZbB1VCf3xBa";
mongoose.connect(`mongodb+srv://shrokbot:${pass}@shrokbot.omeyr.mongodb.net/shrokbot?retryWrites=true&w=majority`, {useNewUrlParser: true});

function connect() {
    return new Promise((resolve, reject)=>{
        if(mongoose.connection.readyState == 4) {

        }
    })
}



function checkForApiKey(guildId) {
    return new Promise(async (resolve, reject)=>{
        console.log("DATABASE READYSTATE ", mongoose.connection.readyState);
        if(mongoose.connection.readyState != 1) {console.log("Database not connected"); reject("No database")}
        if(!guildId) reject("No guild id provided");
        //if(mongoose.connection.readyState != 1) reject("Database not connected");
        
        //Search the mongoose database
        var keys = await Server.find({guildId:guildId.toString()});
        if(keys.length > 0) reject("Key already exists");

        //Generate uuid
        var id = uuid();
        //Write to server
        var tokenPair = new Server({guildId: guildId, guildToken: id});
        tokenPair.save()
        .then(()=>{
            resolve(id);
        })
        .catch(err=>{
            console.log(err);
            reject(err);
        });

    })
}

function checkForGuildId(guildToken) {
    return new Promise(async (resolve, reject)=>{
        if(mongoose.connection.readyState != 1) {console.log("Database not connected"); reject("Database not connected");}
        if(!guildToken) reject("No guild id provided");
        //if(mongoose.connection.readyState != 1) reject("Database not connected");
        
        //Search the mongoose database
        var keys = await Server.find({guildToken:guildToken.toString()});
        console.log("KEYS: ", keys);
        if(keys.length > 0) resolve(keys[0].guildId);
        reject("Does not exist");

    })
}

module.exports = {connect, checkForApiKey, checkForGuildId };