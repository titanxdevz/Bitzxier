const { AuditLogEvent } = require('discord.js')

module.exports = async (client) => {
    client.on('guildAuditLogEntryCreate', async (audit) => {
        const { executor, target } = audit
        let check = await client.db.get(`blacklistserver_${client.user.id}`) || [];
        if (check.includes(audit.target?.guild?.id)) return
            await client.db
            ?.get(`${audit.target?.guild?.id}_${executor?.id}_wl`)
            .then(async (data) => {
                const antinuke = await client.db?.get(
                    `${audit.target?.guild?.id}_antinuke`
                )
                if (antinuke !== true) return
                if (data) {
                    if (data.serverup) return
                }
                if (audit.action == AuditLogEvent.GuildScheduledEventCreate) {
                    if (executor.id === audit.target.guild.ownerId) return
                    if (executor.id === client.user.id) return
                    const member = client.guilds.cache
                        .get(audit.target?.guild?.id)
                        .members.cache.get(executor.id)
                        const panic = await client.db.get(`panic_${audit.target.guild.id}`)
                        if(panic) {
                    const member1 = client.guilds.cache.get(audit.target?.guild?.id).members.cache.get(executor.id)
                    let perms = member1 && member1.roles ? member1.roles.cache.filter(x => x.permissions.has("Administrator") && x.permissions.has("ManageGuild") && x.editable) : null;
                    let role = audit.target.guild.roles.cache.find(role => role.name == 'Quarantine')
                    let punishment = await client.db.get(`panicp_${audit.target.guild.id}`)
                    const action = punishment.data
                      if (!action || action === 'ban') {
                              try {
                                if (executor.bot) {
                                    executor.guild = audit.target.guild
                                    await target.delete().catch((_) => { })
                                    let ok = audit.target.guild.members.cache.get(executor.id) ? audit.target.guild.members.cache.get(executor.id) : await audit.target.guild.members.fetch(executor.id).catch((_) => { })
                                    if (ok) {
                                        ok.roles.cache
                                            .filter(x => x.id !== audit.target.guild.roles.everyone.id && x.id !== role.id)
                                            .forEach(async (r) => {
                                                try {
                                                    if (r.permissions.has("ManageGuild") || r.permissions.has("Administrator")) {
                                                        await r.setPermissions([], 'Panic Mode | Anti Sechdule Event Create | Not Whitelisted').catch((_) => { })
                                                    }
                                                    await ok.roles.remove(r.id).catch((_) => { })
                                                } catch (err) {
                                                    return;
                                                }
                                            });
                                        await client.util.FuckYou(executor, 'Panic Mode | Anti Sechdule Event Create | Not Whitelisted').catch((_) => { })
                                    }
                                } else {
                                    await Promise.all([
                                        executor.guild = audit.target.guild,
                                        await member1.roles.remove(perms, `Panic Mode | Anti Sechdule Event Create | Not Whitelisted`),
                                        perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Sechdule Event Create | Not Whitelisted')),
                                        await client.util.FuckYou(executor, 'Panic Mode | Anti Sechdule Event Create | Not Whitelisted'),
                                    ])
                                }
                            } catch (err) {
                                if (err.code === 429) {
                                    await client.util.handleRateLimit()
                                }
                                return
                            }
                    
                        } else if (action === 'quarantine') {
                            try {
                                if (!role) {
                                    role = await audit.target.guild.roles.create({
                                        name: `Quarantine`,
                                        color: `#b38844`,
                                        permissions: [],
                                        position: 0,
                                        reason: `Panic Mode | Quarantine System`
                                    }).catch(err => null)
                                }
                                if (role.permissions.has("BanMembers") || role.permissions.has("Administrator") || role.permissions.has("KickMembers") || role.permissions.has("ManageChannels") || role.permissions.has("ManageGuild") || role.permissions.has("MentionEveryone") || role.permissions.has("ManageRoles") || role.permissions.has("ManageWebhooks") || role.permissions.has("ModerateMembers") || role.permissions.has("ManageEvents")) {
                                    await role.setPermissions([], 'Removing Dangerous Permissions From Quarentine Role')
                                    await role.setPosition(0)
                                }
                                if (executor.bot) {
                                    executor.guild = audit.target.guild
                                    await target.delete().catch((_) => { })
                                    let ok = audit.target.guild.members.cache.get(executor.id) ? audit.target.guild.members.cache.get(executor.id) : await audit.target.guild.members.fetch(executor.id).catch((_) => { })
                                    if (ok) {
                                        ok.roles.cache
                                            .filter(x => x.id !== audit.target.guild.roles.everyone.id && x.id !== role.id)
                                            .forEach(async (r) => {
                                                try {
                                                    if (r.permissions.has("ManageGuild") || r.permissions.has("Administrator")) {
                                                        await r.setPermissions([], 'Panic Mode | Anti Sechdule Event Create | Not Whitelisted').catch((_) => { })
                                                    }
                                                    await ok.roles.remove(r.id).catch((_) => { })
                                                } catch (err) {
                                                    return;
                                                }
                                            });
                                    }
                                } else {
                                    await Promise.all([
                                        executor.guild = audit.target.guild,
                                         perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Auto Moderation Rule Create | Not Whitelisted')),
                                        await member1.roles.set([role.id], `Panic Mode | Anti Auto Moderation Rule Create | Not Whitelisted`),
                                    ])
                                }
                            } catch (err) {
                                if (err.code === 429) {
                                    await client.util.handleRateLimit()
                                }
                                return
                            }
                        }
                } else {
                    if (member) {
                        if (member.bannable) {
                            member
                                .ban({
                                    reason: 'Guild Scheduled Create | Not Whitelisted'
                                })
                                .catch((err) => null)
                        }
                    }
                    await target.delete()
                }
            }
            })
    })
}
