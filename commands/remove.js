const queueHandler = require("../modules/queueHandler.js");
const playingHandler = require("../modules/nowHandler.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "remove",
    description: "Removes a song from the queue",
    async execute(message, args) {
        //Remove a song from the queue

        if(isNaN(args[0])) return;
        
        queueHandler.deleteFromQueue(message.guild.id, parseInt(args[0]))
        .then((video)=>{
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

            
        })

    }
}