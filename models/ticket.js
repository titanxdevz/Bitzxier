const mongoose = require('mongoose');

const ticketPanelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    panels: [{
        panelId: String,
        panelName : String,
        channelId: String,
        categoryId: String,
        supportRoleId: { type: String, default: null },
        staffRoleId: { type: String, default: null },
        logsChannelId: { type: String, default: null },
        transcriptChannelId: { type: String, default: null },
        enabled: { type: Boolean, default: true },
        channels: {
            type: [String],
            default: []
        }
    }],
    createdBy: [{
        userId: String,
        panelId: String,
        channelId: String,
        status: { type: String, default: "open" }  // NEW FIELD for ticket status
    }]
}, { timestamps: true });

module.exports = mongoose.model('ticketpanel', ticketPanelSchema);
