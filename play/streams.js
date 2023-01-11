const {
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  createAudioResource,
  entersState,
} = require('@discordjs/voice');

const {v4: uuidv4} = require('uuid');

const ytdl = require('ytdl-core-discord');
const {nowPlayingEmbed} = require('./nowPlayingEmbed');

const GuildVoiceClasses = [];

/**
 * Handles guild voice connections. An instance is created for every voice connection to a guild.
 * There is only one instance per guild, because the bot only can be connected to one voice channel
 * at a time.
 *
 *
 **/
class GuildStream {
  #guildId;
  #client;
  #connection;
  #voiceChannel;
  #player;
  #queue = [];
  #uuid;
  #chatId;
  #continueOnEnd = true;

  /**
   *
   * @param {string} guildId The guild id to associate the connection with
   * @param {string} chatId The id of the text channel to send queue updates in
   * @param {Client} client The bot client
   */
  constructor(guildId, chatId, client) {
    if (typeof guildId != 'string') {
      throw new TypeError('Invalid type, guild id must be a string');
    }

    if (!client) throw new Error('Client must be defined!');

    this.#guildId = guildId;
    this.#client = client;
    this.#chatId = chatId;

    this.#uuid = uuidv4();
  }

  /**
   * Connects to a given voice channel.
   *
   * @param {string} channelId The voice channel id to connect to
   * @return {undefined} an empty promise
   */
  connectToVC(channelId) {
    return new Promise((resolve, reject) => {
      if (channelId == this.#voiceChannel && this.#connection) {
        resolve();
        return;
      }

      if (typeof channelId != 'string')
        throw new TypeError('Invalid type, channel id must be a string');

      // Empty the queue, just in case
      this.#queue = [];

      // Fetch the voice channel
      const guild = this.#client.guilds.cache.get(this.#guildId);

      const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: this.#guildId,
        adapterCreator: guild.voiceAdapterCreator,
      });

      connection.on(VoiceConnectionStatus.Ready, (oldState, newState) => {
        this.#voiceChannel = channelId;
        resolve();
      });

      connection.on(VoiceConnectionStatus.Disconnected, () => {
        // The bot has been disconnected for whatever reason. Remove all references to it.
        this.#connection = undefined;
        if (this.#player) {
          try {
            this.#player.stop();
          } catch (error) {
            console.log(
              'COULD NOT STOP PLAYER WHEN DISCONNECTED. PROBABLY NOT SERIOUS'
            );
            console.error(error);
          }
          this.#player = undefined;
        }

        // Delete the queue
        this.#queue = [];

        // Delete all voice channel references
        this.#voiceChannel = undefined;

        // Delete all text channel references
        this.#chatId = undefined;
      });

      this.#connection = connection;
    });
  }

  /**
   * Pipe an audio stream to the currently connected voice channel
   * @param {stream} audioStream The stream to play for every connected user
   */
  async pipeStream(audioStream) {
    return new Promise(async (resolve, reject) => {
      if (this.#player) return;
      if (!this.#connection)
        reject(
          new Error(
            'The bot is currently not connected to a voice channel in this guild'
          )
        );

      // console.log(path.join(path.dirname(__dirname), 'test.ogg'));

      /**
        const resource = createAudioResource(
        path.join(path.dirname(__dirname), 'test.wav'),
        {
            metadata: {
            title: 'A good song!',
            },
        }
        );
        */

      const player = createAudioPlayer();

      this.#player = player;

      player.play(audioStream);

      try {
        await entersState(player, AudioPlayerStatus.Playing, 5_000);

        console.log('Playback has started!');
      } catch (error) {
        console.error(error);
      }

      this.#connection.subscribe(player);
      player.unpause();
      player.on('error', (error) => {
        console.error(error);
      });

      // This triggers when playback has started
      player.on(AudioPlayerStatus.Playing, (msg) => {
        console.log('Playback has started!');
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log('Playback has ended!');
        this.#player = undefined;
        player.stop();
        resolve();
      });
    });
  }

  /**
   *
   * @param {object} video The video to play
   * @param {object} options Additional options
   * @param {boolean} options.playNextInQueue Play next song when this is finished?
   */
  async playVideo(video) {
    return new Promise(async (resolve, reject) => {
      // Absolutely obliterate the current music player uwu
      if (this.#player) {
        this.#player.stop();
        this.#player = undefined;
      }

      // Create an audio source
      console.log(video);
      const stream = await ytdl(video.url, {
        highWaterMark: 1 << 25,
      });
      const resource = createAudioResource(stream);

      // Pipe the new audio source to the current voice channel
      this.pipeStream(resource)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Plays music from the current queue
   */
  async play() {
    if (this.#queue.length == 0) {
      return;
    }

    if (this.#voiceChannel) {
      this.connectToVC(this.#voiceChannel);
    }

    // get first entry in the queue
    const firstInQueue = this.#queue[0];

    // Notify a text channel when video starts playing
    const nowPlaying = nowPlayingEmbed(firstInQueue, this.#client);
    try {
      const textChannel = this.#client.guilds.cache
        .get(this.#guildId)
        .channels.cache.get(this.#chatId);
      textChannel.send({
        embeds: [nowPlaying],
      });
    } catch (error) {
      console.error(error);
    }

    this.playVideo(firstInQueue).then(() => {
      // Remove the first entry
      if (!this.#continueOnEnd) {
        this.#continueOnEnd = true;
        return;
      }

      console.log('Moving over to the next video');
      this.#queue.shift();
      this.play();
    });
  }

  /**
   * Pauses the currently playing music
   * @return {boolean} False for failure, true for success
   */
  pause() {
    if (!this.#player) return false;
    this.#player.pause();
    return true;
  }

  /**
   * Resumes the audio player
   *
   * @return {boolean} False for failure, true for success
   */
  resume() {
    if (!this.#player) return false;
    const state = this.#player.unpause();
    if (state) {
      return true;
    }

    return false;
  }

  /**
   *
   * @param {object} video The video to insert into the queue
   */
  addToQueue(video) {
    // Generate an identifier for the video object
    const uuid = uuidv4();
    video.queueUUID = uuid;
    this.#queue.push(video);
  }

  /**
   * Insert the given video to a specific index in the queue
   *
   * @param {object} video A youtube video
   * @param {number} index The index to insert at
   */
  insertToQueue(video, index) {
    const uuid = uuidv4();
    video.queueUUID = uuid;
    this.#queue.splice(index, 0, video);
  }

  /**
   * Removes an entry in the queue
   *
   * @param {number} index Index to remove
   */
  removeFromQueue(index) {
    if (index > this.#queue.length) throw new RangeError('Index out of range!');
    this.#queue.splice(index, 1);
  }

  /**
   * Disconnects the bot from the voice channel, and stops the playback
   */
  stop() {
    if (this.#player) {
      this.#player.stop();
    }
    if (this.#connection) {
      this.#connection.destroy();
    }

    this.#queue = [];
    this.#connection = undefined;
  }

  /**
   * Skips the current song
   */
  skip() {
    this.#queue.shift();
    if (this.#queue.length == 0) {
      this.stop();
      return;
    }

    this.#continueOnEnd = false;

    this.play();
  }

  /**
   * Dumps the whole queue, except for the first entry
   */
  dumpQueue() {
    this.#queue.splice(1, this.#queue.length);
  }

  /**
   * Fetch the guild queue
   *
   * @return {array} A list of the currently queued songs
   */
  getQueue() {
    return this.#queue;
  }

  /**
   * Returns the associated guild id
   *
   * @return {string} The guild id
   */
  getGuildId() {
    return this.#guildId;
  }

  /**
   * Get the currently active voice channel
   *
   * @return {string} The voice channel id
   */
  getVoiceChannelId() {
    return this.#voiceChannel;
  }

  /**
   * Get the current connection
   *
   * @return {Connection} The current active voice channel
   */
  getConnection() {
    return this.#connection;
  }

  /**
   * Resets connections
   */
  resetConnections() {
    try {
      this.#player.stop();
    } catch (error) {}
    this.queue = [];

    if (this.#connection) {
      this.#connection.destroy();
    }

    this.#connection = undefined;
    this.#continueOnEnd = true;
  }

  /**
   * Binds bot communication to the given text channel
   *
   * @param {string} chatId The new chat id
   */
  setChatId(chatId) {
    if (typeof chatId != 'string')
      throw new TypeError('ChatId must be a string!');

    this.#chatId = chatId;
  }

  /**
   *
   * @return {string} The chat id belonging to the text
   * channel used for communications
   */
  getChatId() {
    return this.#chatId;
  }
}

module.exports = {GuildStream, GuildVoiceClasses};
