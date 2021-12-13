const {prefix, token} = require('../config.json');
const { MessageEmbed } = require("discord.js")
const path = require("path");
const queueHandler = require("../modules/queueHandler.js");


module.exports = {
    name: "queue",
    description: "Shows the currently queued songs",
    async execute(message, args) {
        //Get the queue
        try {
            var queue = await queueHandler.queueExists(message.guild.id);
        } catch (error) {
            console.log(error);    
        }


        if(queue == false) {
            message.channel.send("There is no queue!");
            return;
        }


        var list = [];
        var objs = queue[1].queueEntries;

        for(let i = 0; i < objs.length; i++) {
            list.push(objs[i]);
        }

        //Create queue message
        var queueEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Your queue')

        var x;
        for(x of list) {
            queueEmbed.addField(x.video.title, x.video.timestamp + " | Requested by " + x.user.username);
        }
        
        message.channel.send(queueEmbed);
        
    }
}