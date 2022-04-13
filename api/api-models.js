const mongoose = require("mongoose");
const Server = mongoose.model("ServerToken", {guildId: String, guildToken: String});
const Queue = mongoose.model("ServerQueue", {entries: [], guildId: String}) //{video: videoObject, user: userObject}

module.exports = { Server, Queue };