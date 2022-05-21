const {prefix, token} = require('../config.json');
const { Permissions } = require("discord.js");
module.exports = {
    name: "loop",
    description: "Loops the playing song",
    async execute(message, args) {
        message.channel.send("This command has temporarily been disabled.");
        return;
        //read the config
        try {
            var config = JSON.parse(await fs.readFile("./currentConfig.json"), "utf8");
        } catch (error) {
            return message.channel.send("Fuck. That went horribly wrong.");
        }

        if(message.member.guild.me.hasPermission('ADMINISTRATOR')) {
            //The user is administrator!
            if(config.loopSong) {
                config.loopSong = false;
            } else {
                config.loopSong = true;
            }
        } else {
            if(config.loopSong == true) {
                //Do NOT disable looping, since the user does not have sufficient permissions
                return message.channel.send("Sorry! I can't turn off looping. You're not an administrator.")
            } else {
                config.loopSong = true;
            }
        }
        

        
        fs.writeFile("./currentConfig.json", JSON.stringify(config, null, 4))
        .then(()=>{
            if(config.loopSong) {
                message.channel.send("Looping the current song!");
            } else {
                message.channel.send("I will not loop the song anymore.");
            }
        })
        .catch((err)=>{
            message.channel.send(err);
        })

    }
}