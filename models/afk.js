const mongo = require('mongoose');

const Schema = new mongo.Schema({
    Guild: { type: String, default: null }, // `null` for global AFK
    Member: String,
    Reason: String,
    Time: String,
    IsGlobal: { type: Boolean, default: false } // New field to indicate global AFK
});

module.exports = mongo.model('afk', Schema);
