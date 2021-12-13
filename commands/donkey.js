module.exports = {
    name: "donkey",
    description: "DONKEEEY",
    execute(message, args) {
        async function test() {

            if(message.member.voice.channel) {
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
            } else {
                message.reply("I can't **DONKEY** you if you aren't in a voice channel");
            }
            
            
        }
        test();
    }
}