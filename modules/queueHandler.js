const fs = require("fs-extra");
const path = require("path");

function queueExists(guildId) {
    //Check if guild queue exists
    return new Promise((resolve, reject)=>{
        var filePath = path.join(path.dirname(__dirname), "database", "queue", "queue" + guildId + ".json");
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


function insertToQueue(guildId, video, user, callBack) {
    return new Promise(async (resolve, reject)=>{

        var filePath = path.join(path.dirname(__dirname), "database", "queue", "queue" + guildId + ".json");

        const dbTemplate = {
            queueEntries: []
        }

        //Check if queue database exists
        var data;
        var exists = await queueExists(guildId);
        if(exists == false) {
            //if the queue does not exist, create a suitable database
            data = JSON.parse(JSON.stringify(dbTemplate));
            data.queueEntries.push({video: video, user: user});
            
        } else {
            //get the database contents
            var contents = exists[1];
            contents.queueEntries.push({video: video, user: user});
            data = contents;
        }

        fs.writeFile(filePath, JSON.stringify(data, null, 4), (err)=>{
            if(err) {
                //Did not go well..
                reject(err);
            }

            resolve();
        })
        
    })
}


function deleteQueue(guildId) {
    return new Promise((resolve, reject)=>{
        var filePath = path.join(path.dirname(__dirname), "database", "queue", "queue" + guildId + ".json");
        fs.unlink(filePath, (err)=>{
            if(err) {
                //Oops
                reject(err);
            }

            resolve();
        })
    })
}

module.exports = { queueExists, insertToQueue, deleteQueue };