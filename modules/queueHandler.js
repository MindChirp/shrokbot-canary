const fs = require("fs-extra");
const path = require("path");
const { getGuildQueue, addToQueue, removeFromQueue, deleteGuildQueue } = require("../api/database");

function fetchQueue(guildId) {
    return new Promise((resolve, reject)=>{
        getGuildQueue(guildId)
        .then(res=>{
            if(res.status == 1) {
                resolve(res.result);
            }
        })
        .catch(res=>{
            if(res.status != undefined){
                if(res.status == 0) {
                    resolve(undefined);
                }
            }   
        })


    })
}


function insertToQueue(guildId, video, user) {
    return new Promise(async (resolve, reject)=>{
        if(!video) {reject(new Error("No video")); return;}
        var filePath = path.join(path.dirname(__dirname), "database", "queue", "queue" + guildId + ".json");

        addToQueue(guildId, video, user)
        .then((res)=>{
            console.log(res);
            resolve(res);
        })
        .catch(err=>reject(err));
    })
}

function deleteFromQueue(guildId, index) {
    return new Promise(async (resolve, reject)=>{
        removeFromQueue(guildId, index)
        .then(res=>{
            resolve(res) //Returns the queue
        })
        .catch(err=>{
            reject(err);
        })
    })
}


function deleteQueue(guildId) {
    return new Promise((resolve, reject)=>{
        deleteGuildQueue(guildId)
        .then(()=>{
            resolve();
        })
        .catch(err=>{
            reject(err);
        })
    })
}

module.exports = { fetchQueue, insertToQueue, deleteQueue, deleteFromQueue };