const mongoose = require("mongoose");
const { Queue, Server } = require("./api-models");

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


function getGuildQueue(guildId) {
    return new Promise(async (resolve, reject)=>{
        if(mongoose.connection.readyState != 1) {console.log("Database not connected"); reject("Database not connected")};
        if(!guildId) {reject("No guild id provided")};

        var queue = await Queue.find({guildId: guildId});
        console.log(queue);
        if(queue.length > 0) {
            resolve({status: 1, result: queue[0]});
        }

        reject({status: 0, result: undefined}); //No queue
    })
}


function addToQueue(guildId, video, user) {
    return new Promise(async (resolve, reject)=>{
        if(mongoose.connection.readyState != 1) {console.log("Database not connected"); reject("Database not connected")};
        if(!guildId) {reject("No guild id provided")};
        if(!video) {reject("No video object present")};
        if(!user) {reject("No user object present")};

        var queue = await Queue.find({guildId: guildId});
        console.log("QUEUE: ", queue);
        var entries;
        if(queue.length == 0 || !queue) {
            var queue = new Queue({entries:[{video: video, user: user}], guildId: guildId});
            await queue.save();
            resolve(queue.entries);
            return;
        } else {
            entries = queue[0].entries;
        }
        entries.push({video: video, user: user});
        await Queue.findOneAndUpdate({guildId: guildId}, {entries: entries})
        .then(res=>{
            console.log(res);
        })
        .catch(err=>{
            console.error(err);
            reject(err);
        })
    })
}

function removeFromQueue(guildId, index) {
    return new Promise(async (resolve, reject)=>{
        if(mongoose.connection.readyState != 1) {console.log("Database not connected"); reject("Database not connected")};
        if(!guildId) {reject("No guild id provided")};
        if(isNaN(index)) {reject("No index number present")};
        if(index == 0) index=1;
        var queue = await Queue.find({guildId: guildId});
        if(queue.length == 0) reject(); 
        //Find the index of the video
        var removedEntry = queue[0].entries[index-1].video;
        queue[0].entries.splice(index-1, 1);
        Queue.findOneAndUpdate({guildId: guildId}, {entries: queue[0].entries})
        .then(()=>{
            resolve(removedEntry);
        })
        .catch(err=>{
            reject(err);
        })
        console.log(queue[0].entries);

    })
}

function deleteGuildQueue(guildId) {
    return new Promise(async (resolve, reject)=>{
        if(mongoose.connection.readyState != 1) {console.log("Database not connected"); reject("Database not connected")};
        if(!guildId) {reject("No guild id provided")};
        
        Queue.deleteMany({guildId: guildId})
        .then(()=>{
            resolve();
        })
        .catch(err=>{
            reject(err);
        })

    })
}

module.exports = {connect, checkForApiKey, checkForGuildId, getGuildQueue, addToQueue, removeFromQueue, deleteGuildQueue };