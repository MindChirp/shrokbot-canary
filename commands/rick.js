module.exports = {
    name: "rick",
    description: "RIIICK",
    execute(message, args) {
        if(message.member.voice.channel) {
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
    }
}
