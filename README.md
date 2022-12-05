
# Shrokbot

This is a simple multi-purpose bot built for pure enjoyment by close friends. Use at your own risk.


![Logo](https://assets.change.org/photos/6/hm/yt/LdHMYtIWvVvEGEx-800x450-noPad.jpg?1628008698)


## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)


## Authors

- [@MindChirp](https://github.com/MindChirp)


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PRODUCTION`

`DISCORD_TOKEN`

`CLIENT_ID`


## Features

- Discord slash command support
    - /play `url` - Plays a song from youtube with a given query or url
    - /queue - Lists the queue associated to the guild
    - /remove `index` - Removes a song from the queue at a given index
    - /skip - Skips the currently playing song
    - /bind `channel (optional)` - Binds the bot to the current text channel, or an optional, provided channel
    - /clear - Clears the entire queue, except for the currently playing video
    - /reset - In case everything goes tits up
    - /playtop `url` - Inserts a given song from youtube as the next in queue
    - /pause - Pauses the audio playback
    - /resume - Resumes the audio playback
    - /fuckoff - Disconnects the bot, clearing the queue


## Roadmap

- Add spotify streaming support

- Fix general performance issues

- Perhaps add database support, instead of keeping everything in RAM

- Add seeking functionality

- Make certain commands guild specific. These are not included in the list above


## Run Locally

Clone the project

```bash
  git clone https://github.com/MindChirp/shrokbot-canary
```

Go to the project directory

```bash
  cd shrokbot-canary
```

Install dependencies

```bash
  npm install
```

Set up the `.env` file
```bash
   PRODUCTION=true
   DISCORD_TOKEN='discord_token'
   CLIENT_ID='client_id'
```

The values to put in the `.env` file can be found in the [**discord developer portal.**](https://discord.com/developers/applications)

Start the bot

```bash
  npm start
```


## License

[MIT](https://choosealicense.com/licenses/mit/)

