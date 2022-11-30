const yts = require('yt-search');

// eslint-disable-next-line valid-jsdoc
/**
 * Searches youtube for the given query, and returns a list of videos
 *
 * @param {string} query A url or search term to search for
 * @
 */
function youtubeSearch(query) {
  return new Promise(async (resolve, reject) => {
    // Figure out if the provided query is a search term, or a url
    let term;
    if (query.split('/watch?v=').length > 1) {
      // Extract the video id
      const id = query.split('/watch?v=')[1].split('&')[0];
      term = {videoId: id};
    }

    yts(term ?? query)
      .then((res) => {
        const videos = res;
        if (videos.length == 0) {
          // There were no videos found!
          resolve([[], undefined]);
          return;
        }

        // If a videoId search has been performed, only return the video object
        if (term) {
          resolve([undefined, videos]);
        }

        // Return the list of 4 first videos
        resolve([videos.videos.slice(0, 4), undefined]);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {youtubeSearch};
