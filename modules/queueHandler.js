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


function insertToQueue(guildId, video, user) {
    return new Promise(async (resolve, reject)=>{
        if(!video) {reject(new Error("No video")); return;}
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

function deleteFromQueue({guildId, video}) {
    return new Promise(async (resolve, reject)=>{
        var filePath = path.join(path.dirname(__dirname), "database", "queue", "queue" + guildId + ".json");
        var exists = await queueExists(guildId);
        if(exists[0] == true) {
            var queue = exists[1].queueEntries;

            for(let i = 0; i < queue.length; i++) {
                console.log(queue[i].video.videoId, video.videoId);
                if(queue[i].video.videoId == video.videoId) {
                    queue.splice(i,1);
                    break;
                }
            }

            var data = {
                queueEntries: queue
            }
            
            fs.writeFile(filePath, JSON.stringify(data, null, 4), (err)=>{
                if(err) {
                    //Did not go well..
                    reject(err);
                }
    
                resolve();
            })

        }
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

module.exports = { queueExists, insertToQueue, deleteQueue, deleteFromQueue };