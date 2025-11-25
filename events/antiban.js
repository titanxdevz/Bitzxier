const { AuditLogEvent } = require('discord.js');

module.exports = async (client) => {
    client.on('guildBanAdd', async (ban) => {
        const antinukeEnabled = await client.db.get(`${ban.guild.id}_antinuke`);

        if (!antinukeEnabled) return;

        try {
            const auditLogs = await ban.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd }).catch(() => null);
            const logEntry = auditLogs?.entries?.first();
            if (!logEntry) return;

            const { executor, target, createdTimestamp } = logEntry;
            const difference = Date.now() - createdTimestamp;
            if (difference > 3600000) return; // Ignore old logs

            const isWhitelisted = await client.db.get(`${ban.guild.id}_${executor.id}_wl`);
            if (isWhitelisted?.ban || executor.id === ban.guild.ownerId || executor.id === client.user.id) return;

            await normalModeAction(client, ban, executor, target);
        } catch (err) {
            console.error('Error handling guildBanAdd event:', err);
        }
    });
};

async function normalModeAction(client, ban, executor, target) {
    try {
        executor.guild = ban.guild;
        await client.util.FuckYou(executor, 'Member Ban | Not Whitelisted');

        if (ban.guild.bans.cache.has(target.id)) {
            await ban.guild.members.unban(target, 'Banned By Unwhitelisted Member').catch((err) => {
                if (err.code === 429) {
                    console.warn('Rate limit hit during unban. Retrying...');
                    setTimeout(() => normalModeAction(client, ban, executor, target), 5000);
                }
            });
        }
    } catch (err) {
        console.error('Error in normalModeAction:', err);
    }
}
