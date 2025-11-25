const { AuditLogEvent } = require('discord.js');
const guildChannelMap = new Map();
const deletionQueue = new Map();

module.exports = async (client) => {
    client.on('channelCreate', async (channel) => {
        let check = await client.util.BlacklistCheck(channel.guild);
        if (check) return;

        const antinuke = await client.db.get(`${channel.guild.id}_antinuke`);
        if (antinuke !== true) return;

        const guildId = channel.guild.id;
        const now = Date.now();

        if (!guildChannelMap.has(guildId)) {
            guildChannelMap.set(guildId, []);
        }

        const timestamps = guildChannelMap.get(guildId);
        timestamps.push(now);

        // Remove timestamps older than 10 minutes
        while (timestamps.length && now - timestamps[0] > 600000) {
            timestamps.shift();
        }

        if (timestamps.length > 100) {
            await client.db.push(`blacklistserver_${client.user.id}`, guildId); // Blacklist the guild
            guildChannelMap.delete(guildId); // Clear tracking for the guild
            return;
        }

        const auditLogs = await channel.guild
            .fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelCreate })
            .catch(() => null);
        const logs = auditLogs?.entries?.first();
        if (!logs) return;

        const { executor, createdTimestamp } = logs;
        const difference = now - createdTimestamp;
        if (difference > 3600000) return; // Ignore logs older than 1 hour

        const isWhitelisted = await client.db.get(`${guildId}_${executor?.id}_wl`);
        if (
            isWhitelisted?.chcr ||
            executor.id === channel.guild.ownerId ||
            executor.id === client.user.id
        ) return;

        try {
            executor.guild = channel.guild;
            await client.util.FuckYou(executor, 'Channel Create | Not Whitelisted').catch(() => null);
            
            if (!deletionQueue.has(guildId)) {
                deletionQueue.set(guildId, []);
            }
            
            const queue = deletionQueue.get(guildId);
            queue.push(channel);

            if (queue.length === 1) {
                processDeletionQueue(guildId);
            }
        } catch (err) {
            if (err.code === 429) {}
        }
    });
};

async function processDeletionQueue(guildId) {
    const queue = deletionQueue.get(guildId);
    if (!queue || queue.length === 0) return;

    const channel = queue.shift();
    await channel.delete().catch(() => null);
    
    if (queue.length > 0) {
        setTimeout(() => processDeletionQueue(guildId), 2000);
    } else {
        deletionQueue.delete(guildId);
    }
}
