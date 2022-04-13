const { Client, Intents, Collection } = require("discord.js");
const {prefix, token} = require('./config.json');
const fs = require("fs");


const client = new Client({
    intents: [
        [
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.VOICE_STATES
        ]
    ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
}

client.login(token);

client.once("ready", () => {
    /*client.user.setPresence({
        game:{
            name: "your mama",
            type: "Playing"
        }

    })*/

    client.user.setActivity(`your mamas in 4k`, {
	    type: 'WATCHING',
	    url: 'https://cornhub.website/'
    });

    const ver = require("./package.json");
    console.log("Ready! Running shrokbot version " + ver.version);
    //startBirthdayHandling(); //Start checking for birthdays on this date


    //Send a version update message
    if(process.env.NODE_ENV == "production") {
        var tc = client.channels.cache.get("737346979922968598");
        if(!tc){console.log("No TEXT CHANNEL"); return;}
        tc.send("Shrokbot up and running - `ver" + ver.version + "`.");
    }

})


module.exports = { client };

