const {prefix, token} = require('../config.json');
const { MessageEmbed } = require("discord.js")
const { dbHandler } = require("../modules/database/dbModule");
const path = require("path");

module.exports = {
    name: "queue",
    description: "Plays music from YouTube",
    async execute(message, args) {

        try {
            var db = await dbHandler.get(path.join(path.dirname(__dirname), "database", "queue"), "queue" + message.guild.id)
        } catch (error) {
            //No database --> No queue
            message.channel.send("There are no songs queued.");
            return;
        }

        try {
            var queue = await db.SELECT("*");
        } catch (error) {
            console.log(error);
            message.channel.send("Could not fetch queue.");
            return;
        }

         //Display the queue
         var list = [];
         var objs = queue[1].values;
         var x;
         for(x of objs) {
             list.push(x);
         }

         //Create queue message
         var queueEmbed = new MessageEmbed()
         .setColor('#0099ff')
         .setTitle('Your queue')

         console.log(list);
         var x;
         for(x of list) {
             console.log(x.value.title, x.value.timestamp);
             queueEmbed.addField(x.value.title, x.value.timestamp);
         }

         message.channel.send(queueEmbed);

    }
}