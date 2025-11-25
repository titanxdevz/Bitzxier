const { AuditLogEvent } = require('discord.js')
module.exports = async (client) => {
    client.on('emojiCreate', async (emoji) => {
        let check = await client.util.BlacklistCheck(emoji.guild)
        if (check) return
        const auditLogs = await emoji.guild
            .fetchAuditLogs({ limit: 2, type: AuditLogEvent.EmojiCreate })
            .catch((_) => { })
        const logs = auditLogs?.entries?.first()
        if (!logs) return
        const { executor, target, createdTimestamp } = logs
        let = difference = Date.now() - createdTimestamp
        if (difference > 3600000) return
        await client.db
            ?.get(`${emoji.guild.id}_${executor?.id}_wl`)
            .then(async (data) => {
                const antinuke = await client.db.get(
                    `${emoji.guild.id}_antinuke`
                )
                if (antinuke !== true) return
                if (data) {
                    if (data.mngstemo) return
                }
                if (executor.id === emoji.guild.ownerId) return
                if (executor.id === client.user.id) return
                const panic = await client.db.get(`panic_${emoji.guild.id}`)
                if (panic) {
                    const member1 = emoji.guild.members.cache.get(executor?.id);
                    let perms = member1 && member1.roles ? member1.roles.cache.filter(x => x.permissions.has("Administrator") || x.permissions.has("ManageEmojisAndStickers") && x.editable) : null;
                    let role = emoji.guild.roles.cache.find(role => role.name == 'Quarantine')
                    let punishment = await client.db.get(`panicp_${emoji.guild.id}`)
                    const action = punishment.data
                    if (!action || action === 'ban') {
                        try {
                            if (executor.bot) {
                                executor.guild = emoji.guild
                                await emoji.delete().catch((_) => { })
                                let ok = emoji.guild.members.cache.get(executor.id) ? emoji.guild.members.cache.get(executor.id) : await emoji.guild.members.fetch(executor.id).catch((_) => { })
                                if (ok) {
                                    ok.roles.cache
                                        .filter(x => x.id !== emoji.guild.roles.everyone.id && x.id !== role.id)
                                        .forEach(async (r) => {
                                            try {
                                                if (r.permissions.has("ManageEmojisAndStickers") || r.permissions.has("Administrator")) {
                                                    await r.setPermissions([], 'Panic Mode | Anti Emoji Create | Not Whitelisted').catch((_) => { })
                                                }
                                                await ok.roles.remove(r.id).catch((_) => { })
                                            } catch (err) {
                                                return;
                                            }
                                        });
                                    await client.util.FuckYou(executor, 'Panic Mode | Anti Emoji Create | Not Whitelisted').catch((_) => { })
                                }
                            } else {
                                await emoji.delete().catch((_) => { })
                                await Promise.all([
                                    executor.guild = emoji.guild,
                                    await member1.roles.remove(perms, `Panic Mode | Anti Emoji Create | Not Whitelisted`),
                                    perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Emoji Create | Not Whitelisted')),
                                    await client.util.FuckYou(executor, 'Panic Mode | Anti Emoji Create | Not Whitelisted'),
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
                                role = await emoji.guild.roles.create({
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
                                executor.guild = emoji.guild
                                await emoji.delete().catch((_) => { })
                                let ok = emoji.guild.members.cache.get(executor.id) ? emoji.guild.members.cache.get(executor.id) : await emoji.guild.members.fetch(executor.id).catch((_) => { })
                                if (ok) {
                                    ok.roles.cache
                                        .filter(x => x.id !== emoji.guild.roles.everyone.id && x.id !== role.id)
                                        .forEach(async (r) => {
                                            try {
                                                if (r.permissions.has("ManageEmojisAndStickers") || r.permissions.has("Administrator")) {
                                                    await r.setPermissions([], 'Panic Mode | Anti Emoji Create | Not Whitelisted').catch((_) => { })
                                                }
                                                await ok.roles.remove(r.id).catch((_) => { })
                                            } catch (err) {
                                                return;
                                            }
                                        });
                                        let managed = ok.roles.cache.filter(role => role.managed)
                                        managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Emoji Create| Not Whitelisted')).catch((_) => { })
                                        await member1.roles.add(role.id, `Panic Mode | Anti Emoji Create| Not Whitelisted`).catch((_) => { })
                        }
                            } else {
                                await emoji.delete().catch((_) => { })
                                await Promise.all([
                                    executor.guild = emoji.guild,
                                    perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Emoji Create | Not Whitelisted')),
                                    await member1.roles.set([role.id], `Panic Mode | Anti Emoji Create | Not Whitelisted`),
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
                    try {
                        executor.guild = emoji.guild
                        await client.util
                            .FuckYou(executor, 'Emoji Create | Not Whitelisted')
                            .catch((err) => null)
                        await emoji.delete().catch((_) => { })
                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit()
                        }
                        return
                    }
                }
            })
    })
}
