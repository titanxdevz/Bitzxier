const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  hubChannelId: { type: String, required: true },
  categoryId: { type: String, required: true },
  interfaceChannelId: { type: String, required: true },
  tempVoiceChannels: [{
    channelId: { type: String, required: true },
    ownerId: { type: String, required: true }
  }]
});

module.exports = mongoose.model('GuildjtcConfig', GuildConfigSchema);
