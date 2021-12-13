const queueHandler = require("../modules/queueHandler.js");
const playingHandler = require("../modules/nowHandler.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "remove",
    description: "Removes a song from the queue",
    async execute(message, args) {
        //Remove a song from the queue
        try {
            var queue = await queueHandler.queueExists(message.guild.id);
        } catch (error) {
            console.log(error);
            message.channel.send("Could not remove song from queue");
            return;
        }


        //Sanitize the input
        //We want a number
        parseNum = str => +str.toString().replace(/[^.\d]/g, '');
        var sanitized = Math.floor(parseInt(parseNum(args)));
        if(sanitized <= 0 || isNaN(sanitized)) {
            message.channel.send("This video does not exist");
            return;
        }

        if(queue == false || queue[1].queueEntries.length == 0) {
            //No queue
            message.channel.send("There is no queue");
            return;
        } else if(queue[1].queueEntries.length > 0) {
            //There is a queue
            //Get the video to remove
            try {
                var video = queue[1].queueEntries[sanitized-1].video
            } catch (error) {
                //This video does not exist
                message.channel.send("This video does not exist");
                return;
            }

            try {
                await queueHandler.deleteFromQueue({guildId:message.guild.id, video: video});
            } catch (error) {
                console.log(error);
                message.channel.send("Could not remove video from queue");
                return;
            }


            var embed = new MessageEmbed()
                .setAuthor("Removed from queue", "https://cdn.discordapp.com/avatars/" + message.member.user.id + "/" + message.member.user.avatar + ".webp")
                .setColor('#eb4034')
                .setTitle(video.title)
                .setURL(video.url)
                .setThumbnail(video.image)
                .addFields(
                    {name: "Channel", value: video.author.name, inline:true},
                    {name: "Removed by", value: message.member.user.username, inline:true}
                )

            message.channel.send(embed);

        }
    }
}