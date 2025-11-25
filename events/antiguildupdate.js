const phin = require('phin')
const { AuditLogEvent } = require('discord.js')

module.exports = async (client) => {
    client.on('guildUpdate', async (o, n) => {
        let check =  await client.util.BlacklistCheck(o)
        if(check) return  
        const auditLogs = await o
            .fetchAuditLogs({ limit: 1, type: AuditLogEvent.GuildUpdate })
            .catch((_) => {})
        const logs = auditLogs?.entries?.first()
        if (!logs) return
        const { executor, target, createdTimestamp } = logs
        let = difference = Date.now() - createdTimestamp
        if (difference > 3600000) return
        await client.db
            ?.get(`${n.id}_${executor?.id}_wl`)
            .then(async (data) => {
                const antinuke = await client.db.get(`${n.id}_antinuke`)
                if (antinuke !== true) return
                if (data) {
                    if (data.serverup) return
                }
                if (executor.id === n.ownerId) return
                if (executor.id === client.user.id) return
                const panic = await client.db.get(`panic_${o.id}`)
                if(panic) {
            const member1 = o.members.cache.get(executor?.id);
            let perms = member1 && member1.roles ? member1.roles.cache.filter(x => x.permissions.has("Administrator") || x.permissions.has("ManageGuild") && x.editable) : null;
            let role = o.roles.cache.find(role => role.name == 'Quarantine')
            let punishment = await client.db.get(`panicp_${o.id}`)
            const action = punishment.data
              if (!action || action === 'ban') {
                      try {
                        if (executor.bot) {
                            executor.guild = o
                            const oldIcon = o.iconURL()
                            const oldName = o.name
                            const newIcon = n.iconURL()
                            const newName = n.name
                            if (oldName !== newName) {
                                await n.setName(oldName)
                            }
                            if (oldIcon !== newIcon) {
                                await n.setIcon(oldIcon)
                            }
                            if (!n.equals(o)) {
                                await n
                                    .edit({
                                        features: o.features
                                    })
                                    .catch((_) => {})
                            }
                            const toDelete = ['rules', 'moderator-only']
                            const x = n.channels.cache
                                .forEach((c) => {
                                    setTimeout(() => {
                                        if (toDelete.includes(c.name)) {
                                            c.delete()
                                        }
                                    }, 5000)
                                })
                                .catch((err) => null)
                            let ok = o.members.cache.get(executor.id) ? o.members.cache.get(executor.id) : await o.members.fetch(executor.id).catch((_) => { })
                            if (ok) {
                                ok.roles.cache
                                    .filter(x => x.id !== o.roles.everyone.id && x.id !== role.id)
                                    .forEach(async (r) => {
                                        try {
                                            if (r.permissions.has("ManageGuild") || r.permissions.has("Administrator")) {
                                                await r.setPermissions([], 'Panic Mode | Anti Guild Update | Not Whitelisted').catch((_) => { })
                                            }
                                            await ok.roles.remove(r.id).catch((_) => { })
                                        } catch (err) {
                                            return;
                                        }
                                    });
                                await client.util.FuckYou(executor, 'Panic Mode | Anti Guild Update | Not Whitelisted').catch((_) => { })
                            }
                        } else {
                            const oldIcon = o.iconURL()
                            const oldName = o.name
                            const newIcon = n.iconURL()
                            const newName = n.name
                            if (oldName !== newName) {
                                await n.setName(oldName)
                            }
                            if (oldIcon !== newIcon) {
                                await n.setIcon(oldIcon)
                            }
                            if (!n.equals(o)) {
                                await n
                                    .edit({
                                        features: o.features
                                    })
                                    .catch((_) => {})
                            }
                            const toDelete = ['rules', 'moderator-only']
                            const x = n.channels.cache
                                .forEach((c) => {
                                    setTimeout(() => {
                                        if (toDelete.includes(c.name)) {
                                            c.delete()
                                        }
                                    }, 5000)
                                })
                                .catch((err) => null)
                            await Promise.all([
                                executor.guild = o,
                                await member1.roles.remove(perms, `Panic Mode | Anti Guild Update | Not Whitelisted`),
                                perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Guild Update | Not Whitelisted')),
                                await client.util.FuckYou(executor, 'Panic Mode | Anti Guild Update | Not Whitelisted'),
                            ])
                        }
                await client.util.sleep(2000)
                            } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit()
                        }
                        return
                    }
                
            } else if (action === 'quarantine') {
        try {
          if(!role) {
               role = await o.roles.create({
                  name : `Quarantine`,
                  color : `#b38844`,
                  permissions : [],
                  position : 0,
                  reason : `Panic Mode | Quarantine System`
                }).catch(err => null)
              }
              if (role.permissions.has("BanMembers") || role.permissions.has("Administrator") || role.permissions.has("KickMembers") || role.permissions.has("ManageChannels") || role.permissions.has("ManageGuild") || role.permissions.has("MentionEveryone") || role.permissions.has("ManageRoles") || role.permissions.has("ManageWebhooks") || role.permissions.has("ModerateMembers") || role.permissions.has("ManageEvents")) {
                await role.setPermissions([], 'Removing Dangerous Permissions From Quarentine Role')
                await role.setPosition(0)
            }
              if (executor.bot) {
                executor.guild = o
                const oldIcon = o.iconURL()
                const oldName = o.name
                const newIcon = n.iconURL()
                const newName = n.name
                if (oldName !== newName) {
                    await n.setName(oldName)
                }
                if (oldIcon !== newIcon) {
                    await n.setIcon(oldIcon)
                }
                if (!n.equals(o)) {
                    await n
                        .edit({
                            features: o.features
                        })
                        .catch((_) => {})
                }
                const toDelete = ['rules', 'moderator-only']
                const x = n.channels.cache
                    .forEach((c) => {
                        setTimeout(() => {
                            if (toDelete.includes(c.name)) {
                                c.delete()
                            }
                        }, 5000)
                    })
                    .catch((err) => null)
                let ok = o.members.cache.get(executor.id) ? o.members.cache.get(executor.id) : await o.members.fetch(executor.id).catch((_) => { })
                if (ok) {
                    ok.roles.cache
                        .filter(x => x.id !== o.roles.everyone.id && x.id !== role.id)
                        .forEach(async (r) => {
                            try {
                                if (r.permissions.has("ManageGuild") || r.permissions.has("Administrator")) {
                                    await r.setPermissions([], 'Panic Mode | Anti Guild Update | Not Whitelisted').catch((_) => { })
                                }
                                await ok.roles.remove(r.id).catch((_) => { })
                            } catch (err) {
                                return;
                            }
                        });
                        let managed = ok.roles.cache.filter(role => role.managed)
                        managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Guild Update | Not Whitelisted')).catch((_) => { })
                        await member1.roles.add(role.id, `Panic Mode | Anti Guild Update | Not Whitelisted`).catch((_) => { })                                   
                    }
            } else {
                const oldIcon = o.iconURL()
                const oldName = o.name
                const newIcon = n.iconURL()
                const newName = n.name
                if (oldName !== newName) {
                    await n.setName(oldName)
                }
                if (oldIcon !== newIcon) {
                    await n.setIcon(oldIcon)
                }
                if (!n.equals(o)) {
                    await n
                        .edit({
                            features: o.features
                        })
                        .catch((_) => {})
                }
                const toDelete = ['rules', 'moderator-only']
                const x = n.channels.cache
                    .forEach((c) => {
                        setTimeout(() => {
                            if (toDelete.includes(c.name)) {
                                c.delete()
                            }
                        }, 5000)
                    })
                    .catch((err) => null)
                await Promise.all([
                    executor.guild = o,
                    await member1.roles.remove(perms, `Panic Mode | Anti Guild Update | Not Whitelisted`),
                    perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Guild Update | Not Whitelisted')),
                  await member1.roles.set([role.id], `Panic Mode | Anti Guild Update | Not Whitelisted`),
                ])
            }
            await client.util.sleep(2000)
                        } catch (err) {
                    if (err.code === 429) {
                        await client.util.handleRateLimit()
                    }
                    return
                 }
               }
            } else {

                try {
                    executor.guild = n
                    await client.util
                        .FuckYou(executor, 'Updating Server | Not Whitelisted')
                        .catch((err) => null)

                    const oldIcon = o.iconURL()
                    const oldName = o.name

                    const newIcon = n.iconURL()
                    const newName = n.name

                    if (oldName !== newName) {
                        await n.setName(oldName)
                    }

                    if (oldIcon !== newIcon) {
                        await n.setIcon(oldIcon)
                    }
                    if (!n.equals(o)) {
                        await n
                            .edit({
                                features: o.features
                            })
                            .catch((_) => {})
                    }

                    const toDelete = ['rules', 'moderator-only']
                    const x = n.channels.cache
                        .forEach((c) => {
                            setTimeout(() => {
                                if (toDelete.includes(c.name)) {
                                    c.delete()
                                }
                            }, 5000)
                        })
                        .catch((err) => null)
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

