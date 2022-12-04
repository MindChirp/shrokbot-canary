const collectors = [];

/**
 * Removes the specified collector from the collector list
 *
 * @param {Collector} collector The collector to remove
 */
function removeCollector(collector) {
  // Remove the collector from the collectors array
  const index = collectors.findIndex((object) => {
    return object.uuid == collector.uuid;
  });

  if (index != -1) {
    collectors.splice(index, 1);
  }
}

/**
 *  Adds the specified collector to the collector list
 *
 * @param {Collector} collector The collector to add to the collector list
 */
function addCollector(collector) {
  if (!collector.uuid) {
    collector.uuid = uuidv4();
  }

  collectors.push(collector);
}

module.exports = {collectors, addCollector, removeCollector};
