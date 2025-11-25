const { AuditLogEvent } = require('discord.js')

module.exports = async (client) => {
    client.on('guildMemberAdd', async (member) => {
        try {
            if (await client.util.BlacklistCheck(member.guild)) return;

            const auditLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd }).catch(() => null);
            const logEntry = auditLogs?.entries?.first();
            if (!logEntry) return;

            const { executor, target, createdTimestamp } = logEntry;
            const difference = Date.now() - createdTimestamp;
            if (difference > 3600000) return; // Ignore old logs

            const isWhitelisted = await client.db.get(`${member.guild.id}_${executor.id}_wl`);
            const antinukeEnabled = await client.db.get(`${member.guild.id}_antinuke`);
            if (!antinukeEnabled) return;
            if (isWhitelisted?.botadd || executor.id === member.guild.ownerId || executor.id === client.user.id) return;
            if (!target.bot || target.id !== member.id) return;

            const panicMode = await client.db.get(`panic_${member.guild.id}`);
            if (panicMode) {
                await handlePanicMode(client, member, executor, target);
            } else {
                await normalModeAction(client, member, executor, target);
            }
        } catch (err) {
            return;
        }
    });

    client.on('guildMemberAdd', async (member) => {
        if (await client.util.BlacklistCheck(member.guild)) return;
        const unverified = await client.db.get(`antiunverified_${member.guild.id}`) || null;
        if (!unverified) return;
        
        const auditLogs = await member.guild.fetchAuditLogs({ limit: 1, type: 'BOT_ADD' }).catch(() => null);
        const logEntry = auditLogs?.entries?.first();
        if (!logEntry) return;

        const { executor, target, createdTimestamp } = logEntry;
        const difference = Date.now() - createdTimestamp;
        if (difference > 5000) return;

        try {
            const flags = await member.guild.members.cache.get(target.id).user.flags.toArray();
            if (unverified && member.user.bot && !flags.includes('VERIFIED_BOT')) {
                if (executor.id === member.guild.ownerId) return;
                await member.ban({ reason: 'Anti Unverified Bot Addition Filter is on' }).catch(() => null);
            }
        } catch (error) {
             return;
        }
    });
};

async function handlePanicMode(client, member, executor, target) {
    try {
        const memberExecutor = member.guild.members.cache.get(executor.id) || await member.guild.members.fetch(executor.id);
        const botMember = member.guild.members.cache.get(client.user.id);

        const perms = memberExecutor.roles.cache.filter(role =>
            role.permissions.has('Administrator') || role.permissions.has('ManageGuild')
        );

        const quarantineRole = await getOrCreateQuarantineRole(member.guild);
        const action = await client.db.get(`panicp_${member.guild.id}`);

        if (action?.data === 'ban') {
            await banExecutor(client, member, executor, target, memberExecutor, perms, botMember);
        } else if (action?.data === 'quarantine') {
            await quarantineExecutor(client, member, executor, target, memberExecutor, quarantineRole, perms, botMember);
        }
    } catch (err) {
        if (err.code === 429) {
            await client.util.handleRateLimit();
        } else {
            console.error('Error handling panic mode:', err);
        }
    }
}

async function normalModeAction(client, member, executor, target) {
    try {
        executor.guild = member.guild
        await client.util.FuckYou(executor, 'Bot Add | Not Whitelisted');
        await client.util.FuckYou(target, 'Illegal Bot | Not Whitelisted');
    } catch (err) {
        console.error('Error in normal mode action:', err);
    }
}

async function banExecutor(client, member, executor, target, memberExecutor, perms, botMember) {
    try {
        executor.guild = member.guild
        await client.util.FuckYou(target, 'Panic Mode | Bot Add | Auto Recovery');
        await client.util.FuckYou(executor, 'Panic Mode | Anti Bot Add | Not Whitelisted');
        await removeDangerousPermissions(memberExecutor, perms, botMember, executor.bot);
    } catch (err) {
        console.error('Error banning executor:', err);
    }
}

async function quarantineExecutor(client, member, executor, target, memberExecutor, quarantineRole, perms, botMember) {
    try {
        executor.guild = member.guild
        await client.util.FuckYou(target, 'Panic Mode | Bot Add | Auto Recovery');
        if (memberExecutor.roles.highest.position < botMember.roles.highest.position) {
            await memberExecutor.roles.set([quarantineRole.id], 'Panic Mode | Anti Bot Add | Not Whitelisted');
        } else {
            await Promise.all(memberExecutor.roles.cache.map(async (role) => {
                if (role.editable) {
                    await memberExecutor.roles.remove(role.id, 'Panic Mode | Anti Bot Add | Not Whitelisted');
                }
            }));
            await memberExecutor.roles.add(quarantineRole.id, 'Panic Mode | Anti Bot Add | Not Whitelisted');
        }
        await Promise.all(perms.map(async role => {
            await role.setPermissions([], 'Panic Mode | Anti Bot Add | Not Whitelisted');
        }));
    } catch (err) {
        console.error('Error quarantining executor:', err);
    }
}

async function removeDangerousPermissions(memberExecutor, perms, botMember, isBot) {
    try {
        if (isBot) {
            for (const role of perms.values()) {
                await role.setPermissions([], 'Panic Mode | Anti Bot Add | Not Whitelisted').catch(() => null);
            }
        } else {
            if (memberExecutor.roles.highest.position < botMember.roles.highest.position) {
                await memberExecutor.roles.set([], 'Panic Mode | Anti Bot Add | Not Whitelisted');
            } else {
                await Promise.all(perms.map(async role => {
                    await role.setPermissions([], 'Panic Mode | Anti Bot Add | Not Whitelisted');
                    await memberExecutor.roles.remove(role.id);
                }));
            }
        }
    } catch (err) {
        console.error('Error removing dangerous permissions:', err);
    }
}

async function getOrCreateQuarantineRole(guild) {
    let role = guild.roles.cache.find(role => role.name === 'Quarantine');
    if (!role) {
        role = await guild.roles.create({
            name: 'Quarantine',
            color: '#b38844',
            permissions: [],
            reason: 'Panic Mode | Quarantine System'
        }).catch(() => null);
    }
    if (role && (role.permissions.has('ManageGuild') || role.permissions.has('Administrator'))) {
        await role.setPermissions([], 'Removing Dangerous Permissions From Quarantine Role');
    }
    return role;
}
