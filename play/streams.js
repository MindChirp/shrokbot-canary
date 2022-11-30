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

  /**
   *
   * @param {string} guildId The guild id to associate the connection with
   * @param {Client} client The bot client
   */
  constructor(guildId, client) {
    if (typeof guildId != 'string') {
      throw new TypeError('Invalid type, guild id must be a string');
    }

    if (!client) throw new Error('Client must be defined!');

    this.#guildId = guildId;
    this.#client = client;
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
      const stream = await ytdl(video.url, {highWaterMark: 1 << 25});
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
  play() {
    if (this.#queue.length == 0) {
      return;
    }

    if (this.#voiceChannel) {
      this.connectToVC(this.#voiceChannel);
    }

    // get first entry in the queue
    const firstInQueue = this.#queue[0];
    this.playVideo(firstInQueue).then(() => {
      // Remove the first entry
      console.log('Moving over to the next video');
      this.#queue.shift();
      this.play();
    });
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
   * Disconnects the bot from the voice channel, and stops the playback
   */
  stop() {
    this.#player.stop();
    this.#queue = [];
    this.#connection.destroy();
    this.#connection = undefined;
  }

  /**
   * Skips the current song
   */
  skip() {
    // this.#player.stop();
    this.#queue.shift();
    if (this.#queue.length == 0) {
      this.stop();
      return;
    }
    this.play();
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
   * Get the current connection
   *
   * @return {Connection} The current active voice channel
   */
  getConnection() {
    return this.#connection;
  }
}

module.exports = {GuildStream, GuildVoiceClasses};
