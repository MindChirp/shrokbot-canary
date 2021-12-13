const fs = require("fs-extra");
const path = require("path");

function nowExists(guildId) {
    //Check if guild queue exists
    return new Promise((resolve, reject)=>{
        var filePath = path.join(path.dirname(__dirname), "database", "playing", "playing" + guildId + ".json");
        fs.readFile(filePath, "utf8", (err, data)=>{
            if(err) {resolve(false)};
            try {
                resolve([true, JSON.parse(data)]);
            } catch (error) {
                reject(false);
            }
        })
    })
}


function insertToPlaying(guildId, video, user) {
    return new Promise(async (resolve, reject)=>{

        var filePath = path.join(path.dirname(__dirname), "database", "playing", "playing" + guildId + ".json");

        const dbTemplate = {
            playing:[]
        }

        //if the queue does not exist, create a suitable database
        var data = JSON.parse(JSON.stringify(dbTemplate));
        data.playing.push({video: video, user: user});

        fs.writeFile(filePath, JSON.stringify(data, null, 4), (err)=>{
            if(err) {
                //Did not go well..
                reject(err);
            }

            resolve();
        })
        
    })
}


function deletePlaying(guildId) {
    return new Promise((resolve, reject)=>{
        var filePath = path.join(path.dirname(__dirname), "database", "playing", "playing" + guildId + ".json");
        fs.unlink(filePath, (err)=>{
            if(err) {
                //Oops
                reject(err);
            }

            resolve();
        })
    })
}


module.exports = { nowExists, insertToPlaying, deletePlaying };