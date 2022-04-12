const mongoose = require("mongoose");
const Server = mongoose.model("ServerToken", {guildId: String, guildToken: String});


module.exports = { checkForApiKey };