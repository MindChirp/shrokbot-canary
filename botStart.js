const { Client, Intents, Collection } = require("discord.js");
const queueHandler = require("./modules/queueHandler");

const fs = require("fs");
const { get } = require("http");
const { start } = require("repl");
const {prefix, token} = require('./config.json');
const dotenv = require("dotenv");
const { startBirthdayHandling } = require("./birthdayCommands/birthdayhandler.js");

dotenv.config();

//client.commands = new Collection();
const autoUpdate = require("auto-git-update");
const path = require("path");
const updateConfig = {
    repository: "https://github.com/MindChirp/shrokbot-canary",
    tempLocation: path.dirname(__dirname),
    executeOnComplete: path.join(__dirname, "restart.bat"),
    exitOnComplete: true
}

var client = {
    client: undefined
}; //The export


/*
THIS CODE REACTS IF A USER CONNECTS TO A CHANNEL. CAN BE USEFUL SOMETIME IN THE FUTURE


client.on("voiceStateUpdate", (oldVoiceState, newVoiceState)=>{
    if(newVoiceState.channel) {
        console.log("Connected to " + newVoiceState.channel.name);
    } else if(oldVoiceState.channel) {
        console.log("Left channel");
    }
})


*/

function startBot() {
    console.log("STARTING BOT")
    client.client = require("./client").client;
    

    async function updateCheckLoop() {
        
        var updater = new autoUpdate(updateConfig);
        try {
            await updater.autoUpdate();
        } catch (error) {
            console.log(error);
        }
        
        setTimeout(()=>{
            updateCheckLoop()
        }, 60000)
    }

    if(process.env.NODE_ENV == "production") {
        updateCheckLoop();
    } else {
        console.log("Bot is not running in production, skipping autoUpdate");
    }

    //const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


    //Fetch timestamps on program start
    var timestamps;
    fs.readFile("./timestamps.json", (err, data) => {
        if(err) throw err;

        var dat = JSON.parse(data);
        timestamps = dat.timestamps;
    }) 

    var startRandomTime = 0;
    var countdown = 0;
    var randomHour;
    var randomMinute;
    var randomRickHour = 0;

    setInterval(()=>{
        //Read through the timestamp array, check if there is a matching time
        var d = new Date();
        var n = d.toLocaleTimeString();
        var days = d.getDay();
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var seconds = d.getSeconds();


        //Printer ut tiden
        if(countdown == 5 || countdown == 10 || countdown == 15 || countdown == 20 ){
            console.log(days + " " + n);
        }


        //Beregne og printe ut random rickroll
        if(startRandomTime == 0){
            randomHour = Math.floor((Math.random() * 8) + 16);
            randomMinute = Math.floor((Math.random() * 59));
            //legger til 0 foran hvis over 10
            if (randomHour < 10) {
                randomHour = "0" + randomHour;
            }
            if (randomMinute < 10) {
                randomMinute = "0" + randomMinute;
            }
            console.log("New random rickroll assigned : "+randomHour+":"+randomMinute);
            startRandomTime = 1;
        }else if(randomRickHour == 0 && countdown == 20){
            console.log("The random rickroll will commence at this timestamp : "+randomHour+":"+randomMinute);
            countdown = 0;
        }else if(randomRickHour == 1 && countdown == 20){
            console.log("The random rick hour has passed, it was : "+randomHour+":"+randomMinute);
            countdown = 0;
        }else {countdown += 1}
        
        if (hours == 0 && minutes == 0 && seconds == 00){
            startRandomTime = 0;
            randomRickHour = 0;
        }




        if(hours == randomHour && minutes == randomMinute && seconds == 00){

            randomRickHour = 1;
            console.log(randomHour, randomMinute);
            var voiceChannel = client.client.channels.cache.get("263300337320853506");
            if (!voiceChannel) return console.error("The channel does not exist! Check ID of channel");
            voiceChannel.join().then(connection => {
                const dispatcher = connection.play('rick.mp3', {
                    volume: 1,
                })
                dispatcher.on('finish', end => {
                    
                    connection.disconnect();
                    dispatcher.destroy();
                });
            }).catch(err => console.log(err))


        }

        var x;
        if(!timestamps) return;
        for(x of timestamps) {
            (()=>{
                var y = x;
                if(hours == y.hours && minutes == y.minutes && seconds == 00 && y.days != 0) {
                    var voiceChannel = client.client.channels.cache.get("263300337320853506");
                    if (!voiceChannel) return console.error("The channel does not exist! Check ID of channel");
                    voiceChannel.join().then(connection => {
                        const dispatcher = connection.play(y.file, {
                            volume: 1,
                        })
                        
                        dispatcher.on('finish', end => {
                            
                            connection.disconnect();
                            dispatcher.destroy();
                        });
                    }).catch(err => console.log(err))
                }
            })();
        }
    }, 1000)




    client.client.on("message", async message => {

        
        if(!message.guild) return;
        if(!message.content.startsWith(prefix) || message.author.bot) return;

            
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (!client.client.commands.has(command)) return;

            try {
                client.client.commands.get(command).execute(message, args);
            } catch (error) {
                console.error(error);
                message.reply('there was an error trying to execute that command!');
            }

                

    });

    this.returnClient = ()=>{
        return client;
    }



    function playSongFromUrl(url, title, guildId) {
        
         console.log("CLIENT= ", client);
     }
     
     //Start the api
     const api = require("./api/api");
     api.startApi();

}




module.exports = { startBot, client };