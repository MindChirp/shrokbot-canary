const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const { get } = require("http");
const { start } = require("repl");
const {prefix, token} = require('./config.json');
client.commands = new Discord.Collection();
const autoUpdate = require("auto-git-update");
const path = require("path");
const updateConfig = {
    repository: "https://github.com/MindChirp/shrokbot-canary",
    tempLocation: path.dirname(__dirname),
    executeOnComplete: path.join(__dirname, "restart.bat"),
    exitOnComplete: true
}


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

//updateCheckLoop();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


//Fetch timestamps on program start
var timestamps;
fs.readFile("./timestamps.json", (err, data) => {
    if(err) throw err;

    var dat = JSON.parse(data);
    timestamps = dat.timestamps;
}) 







for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
}



client.once("ready", () => {
    client.user.setPresence({
        game:{
            name: "your mama",
            type: "Playing"
        }
    })

    const ver = require("./package.json");
    console.log("Ready! Running shrokbot version " + ver.version);

    module.exports = { client };
})

client.login(token);


var startRandomTime = 0;
var countdown = 0;
var randomHour;
var randomMinute;
var randomRickHour = 0;

setInterval(()=>{
    //Read through the timestamp array, check if there is a matching time
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
	var seconds = d.getSeconds();
	var days = d.getDay();

	

	if(countdown == 5 || countdown == 10 || countdown == 15 || countdown == 20 ){

			if(hours < 10 && minutes < 10 && seconds < 10){
				console.log(days + " 0" + hours + ":" + "0" + minutes + ":" + "0" + seconds);
			}else if(hours < 10 && minutes < 10){
				console.log(days + " 0" + hours + ":" + "0" + minutes + ":" +seconds);
			}else if(hours < 10 && seconds < 10){
				console.log(days + " 0" + hours + ":" + minutes + ":" + "0" + seconds);
			}else if(minutes < 10 && seconds < 10){
				console.log(days, hours + ":" + "0" + minutes + ":" + "0" + seconds);
			}else if(hours < 10){
				console.log(days + " 0" + hours + ":" + minutes + ":" + seconds);
			}else if(minutes < 10){
				console.log(days + " " + hours + ":" + "0" + minutes + ":" + seconds);
			}else if(seconds < 10){
				console.log(days + " " + hours + ":" + minutes + ":" + "0" + seconds);
			}else{
				console.log(days + " " + hours + ":" + minutes + ":" + seconds);
			}
	}




	if(startRandomTime == 0){
        randomHour = Math.floor((Math.random() * 8) + 16);
        randomMinute = Math.floor((Math.random() * 59));
		startRandomTime = 1;
		if(randomRickHour == 1){
			console.log("The random rick hour has passed, it was : " + randomHour + ":" + randomMinute);
		}else if(randomHour < 10 && randomMinute < 10){
			console.log("New random rickroll assigned : " + "0" + randomHour + ":" + "0" + randomMinute);
		}else if(randomHour < 10){
			console.log("New random rickroll assigned : " + "0" + randomHour + ":" + randomMinute);
		}else if(randomMinute < 10){
			console.log("New random rickroll assigned : " + randomHour + ":" + "0" + randomMinute);
		}else{
			console.log("New random rickroll assigned : " + randomHour + ":" + randomMinute);
		}
    } else if (hours == 0 && minutes == 0 && seconds == 00) {
		startRandomTime = 0;
		randomRickHour = 0;
	}


    if (countdown == 20){
		if(randomRickHour == 1){
			console.log("The random rick hour has passed, it was : " + randomHour + ":" + randomMinute);
		}else if(randomHour < 10 && randomMinute < 10){
			    console.log("The random rickroll is going to be executed at this timestamp: " + "0" + randomHour + ":" + "0" + randomMinute);
			}else if(randomHour < 10){
				console.log("The random rickroll is going to be executed at this timestamp: " + "0" + randomHour + ":" + randomMinute);
			}else if(randomMinute < 10){
				console.log("The random rickroll is going to be executed at this timestamp: " + randomHour + ":" + "0" + randomMinute);
			}else{
				console.log("The random rickroll is going to be executed at this timestamp: " + randomHour + ":" + randomMinute);
			}
		countdown = 0;
    }else{
        countdown += 1;
    }
	



    if(hours == randomHour && minutes == randomMinute && seconds == 00){

		randomRickHour = 1;
        console.log(randomHour, randomMinute);
        var voiceChannel = client.channels.cache.get("263300337320853506");
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
    for(x of timestamps) {
        (()=>{
            var y = x;
            if(hours == y.hours && minutes == y.minutes && seconds == 00 && y.days != 0) {
                console.log(y);
                var voiceChannel = client.channels.cache.get("263300337320853506");
                if (!voiceChannel) return console.error("The channel does not exist! Check ID of channel");
                voiceChannel.join().then(connection => {
                    console.log(y);
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




client.on("message", async message => {

     
    if(!message.guild) return;


        if(message.content == "§donkey") {
            var voiceChannel = message.member.voice.channel;
            voiceChannel.join().then(connection => {
              const dispatcher = connection.play('donkey.mp3', {
                  volume: 1,
              })
			  
			  console.log(message.member.user.username + " triggered donkey");
    
              dispatcher.on('finish', end => {
                
                  connection.disconnect();
                  dispatcher.destroy();
                });
            }).catch(err => console.log(err))
        }


        if(message.content == "#rick") {
            var voiceChannel = message.member.voice.channel;
            voiceChannel.join().then(connection => {
              const dispatcher = connection.play('rick.mp3', {
                  volume: 1,
              })
    
				console.log(message.member.user.username + " triggered rickroll");
	
              dispatcher.on('finish', end => {
                
                  connection.disconnect();
                  dispatcher.destroy();
                });
            }).catch(err => console.log(err))
        }


    if(!message.content.startsWith(prefix) || message.author.bot) return;

        
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!client.commands.has(command)) return;

        try {
            client.commands.get(command).execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('there was an error trying to execute that command!');
        }

            

})