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
            var queue = await queueHandler.fetchQueue(message.guild.id);
        } catch (error) {
            console.log(error);    
        }

        console.log("QUEUE ", queue)

        queue = queue || {entries:[], guildId: message.guild.id};
        
        if(queue.entries.length == 0) {
            message.channel.send("There is no queue!");
            return;
        }


        var list = [];
        var objs = queue.entries;

        for(let i = 0; i < objs.length; i++) {
            list.push(objs[i]);
        }

        //Create queue message
        var queueEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Your queue')

        var x;
        for(let i = 0; i < list.length; i++) {
            if(!list[i].video) continue;
            //Treat the video title
            var title = list[i].video.title;
            
            function trunc(txt, length) {
                var str = txt;
                if(str.length > length) {
                    return txt.slice(0,length) + "...";
                } else {
                    return txt;
                }
            }

            var truncated = trunc(title,40);

            var username = list[i].user=="Shrokbot client"?"Client":list[i].user.username;

            queueEmbed.addField("**`" + parseInt(i+1) + ".`**", truncated + " `" + list[i].video.timestamp + " | Requested by " + username +"`");
        }
        
        message.channel.send(queueEmbed);
        
    }
}