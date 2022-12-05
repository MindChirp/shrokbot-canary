const timeTricks = [];

/**
 * Coordinates all the time based party trick features
 * @author Frikk O. Larsen
 * @version 1.0.0
 */
function checkTime() {
  // Get epoch time
  const time = new Date().getTime;

  // Get all the time based commands, and fetch their time
  for (const trick of timeTricks) {
  }
}

/**
 * The superclass for all trick classes
 */
class Trick {
  #name;
  #exec;
  #client;
  #time;

  /**
   * Create a new Trick instance
   *
   * @param {string} name Name of the trick
   * @param {*} exec Execution code
   * @param {*} client Bot client
   */
  constructor(name, exec, client) {
    this.#name = name;
    this.#exec = exec;
    this.#client = client;
  }

  /**
   * Executes the trick
   *
   * @param {number} time The current epoch time in ms(?)
   */
  execute(time) {}
}

module.exports = {checkTime, Trick};
