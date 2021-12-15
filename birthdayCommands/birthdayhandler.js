const fs = require("fs-extra");
const path = require("path");
const { playVideo } = require("../modules/playVideo.js");
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { MessageEmbed } = require("discord.js");
var client;
var birthdays;
var updateConfigInterval = 1; //In minutes

function startBirthdayHandling() {
    sendWishes();
    client = require("../bot.js").client;
    //playBirthdayWishes({"type":"link", "source": "https://www.youtube.com/watch?v=cpM3-j0pNPI"});
    setInterval(async ()=>{
        //Update the birthday config once in a while
        try {
            birthdays = JSON.parse(await fs.readFile(path.join(__dirname, "birthdays.json"), "utf8"));
        } catch (error) {
            //Could not load birtdays list
            console.log(error);
            console.log("Could not log birtdays list, there will be another attempt in " + updateConfigInterval + " minutes.");
        }
    }, 2000)



    setInterval(()=>{
        checkForBirthday();
    }, 1000)



}

var birthdayList = [{"name":"Jakob Behrens", "date":"02/05", "music": {"type":"link", "source": "https://www.youtube.com/watch?v=cpM3-j0pNPI"}}];

function checkForBirthday() {
    if(!birthdays) return;
    var date = new Date();
    //Check if the current date equals to a birthday
    for(let i = 0; i < birthdays.birthdays.length; i++) {
        //Check if any date matches
        var newDate = new Date();
        newDate.setDate(birthdays.birthdays[i].date.toString().split("/")[0]);
        newDate.setMonth(birthdays.birthdays[i].date.toString().split("/")[1]-1);
        var s = date.getSeconds();
        var m = date.getMinutes();
        var h = date.getHours();
        if(newDate.getDate() == date.getDate() && newDate.getMonth() == date.getMonth()) {
            //Today is a birthday!
            //Check if the clock is precisely 12:00:00 AM
            if(h == 0 && m == 0 && s == 0 || h==12 && m==0 && s==0) {
                //The time is nigh!
                //Send a message to the text channel
                var birthday = birthdays.birthdays[i];
                birthdayList.push(birthday);

                console.log("BIRTHDAY FOUND: ", birthdays.birthdays[i])
            }
        }
    }


    //Execute birthday wishes
    //sendWishes();
}


async function sendWishes() {
    if(birthdayList.length == 0) return;
    //Go through each wish, if there are multiple for one day
    for(let i = 0; i < birthdayList.length; i++) {
        //Get the media
        var media = birthdayList[i].music;
        
        try {
            await playBirthdayWishes(media);
        } catch (error) {
            
        }


        //Send a birthday wish in the general text channel
        var tc = client.channels.cache.get("263300337320853505");
        if(!tc){console.log("No TEXT CHANNEL"); return;}

        tc.send("Happy birthday, `" + birthdayList[i].name + "`! I hope you have a wonderful day!");

    }
}
async function playBirthdayWishes(media) {
    //Check if it is a link or a pre-downloaded media file
    if(media.type == "link") {
        //Play as youtube video
        var videoFinder = async(query)=>{
            var videoResult = await ytSearch(query);
            return (videoResult.videos.length > 1)?videoResult.videos[0]:null;
        }


        try {
            var video = await videoFinder(media.source);
        } catch (error) {
            console.log(error);
            return;
        }


        //Play the video for the birthday boy!

        /*

        TODO:
        Figure out a way to replace the message key, and
        a way to get the connection key. These are needed for the bot to be able to connect
        to the voice channel.

        */

        var vc = client.channels.cache.get("263300337320853506"); //General kenobi
        if(!vc){console.log("No VOICE CHANNEL"); return;}
        
        var connection = await vc.join();

        playVideo({video:video, connection:connection, ytdl:ytdl, config: {}});

    }
}


module.exports = { startBirthdayHandling }