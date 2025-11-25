const { AuditLogEvent } = require('discord.js')
module.exports = async (client) => {
    client.on('guildMemberUpdate', async (o, n) => {
        let role = n.guild.roles.premiumSubscriberRole
        if (role) {
            let before = o.roles.cache.has(role.id)
            let after = n.roles.cache.has(role.id)
            if (!before && after) {
                client.util.sendBooster(n.guild, n)
            }
        }
        const auditLogs = await n.guild
            .fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberRoleUpdate })
            .catch((_) => {})
        const logs = auditLogs?.entries?.first()
        if (!logs) return
        const { executor, target, createdTimestamp } = logs
        let = difference = Date.now() - createdTimestamp
        if (difference > 5000) return
        await client.db
            ?.get(`${o.guild.id}_${executor?.id}_wl`)
            .then(async (data) => {
                const antinuke = await client.db.get(`${o.guild.id}_antinuke`)
                if (antinuke !== true) return
                if (data) {
                    if (data.memup) return
                }
                if (executor.id === n.guild.ownerId) return
                if (executor.id === client.user.id) return
                if (n.user.id !== target.id) return

                const member = n.guild.members.cache.get(executor?.id)
                if (!member?.permissions?.has('Administrator')) return
                if (!member?.permissions?.has('ManageRoles')) return
                if (
                    !member?.permissions?.has('Administrator') &&
                    !member?.permissions?.has('ManageRoles')
                )
                    return
                try {
                    const oldRoles = o.roles
                    const newRoles = n.roles

                    if (oldRoles !== newRoles) {
                        executor.guild = n.guild
                        await n.roles.set(o.roles.cache).catch((_) => {})
                        await client.util
                            .FuckYou(
                                executor,
                                'Member Role Update | Not Whitelisted'
                            )
                            .catch((err) => null)
                    }
                } catch (err) {
                    if (err.code === 429) {
                        await client.util.handleRateLimit()
                    }
                    return
                }
            })
    })
}

