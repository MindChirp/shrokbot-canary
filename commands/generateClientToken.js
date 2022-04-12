const {prefix, token} = require('../config.json');
const mongoose = require("mongoose");
const { checkForApiKey } = require('../api/api.js');

module.exports = {
    name: "clienttoken",
    description: "Generates a client token",
    async execute(message, args) {
        //message.channel.send("This function is under development!");
    
        var guildId = message.guild.id;
        checkForApiKey(guildId)
            .then((res)=>{
                console.log("No token generated for this server");
            })
            .catch(err=>console.log(err));
    
    }
}