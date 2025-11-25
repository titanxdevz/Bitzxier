const { AuditLogEvent } = require('discord.js')
module.exports = async (client) => {
    client.on('guildAuditLogEntryCreate', async (audit, guild) => {
        try {
            if(audit.action != AuditLogEvent.IntegrationCreate) return;
            const check = await client.db.get(`blacklistserver_${client.user.id}`) || [];
            if (check.includes(guild.id)) return;
            const { executorId, target } = audit;
            const antinukeEnabled = await client.db.get(`${guild.id}_antinuke`);
            if (!antinukeEnabled) return;
            const isWhitelisted = await client.db.get(`${guild.id}_${executorId}_wl`);
            if (isWhitelisted?.botadd || executorId === guild.ownerId || executorId === client.user.id) return
            try {
                await guild.members.ban(executorId,{ reason : `Bot Add | Not Whitelisted` }).catch(() => null);
            } catch (err) {
                if (err.code === 429) {
                }
            }
        } catch (err) {
                return;
        }
    });
};
