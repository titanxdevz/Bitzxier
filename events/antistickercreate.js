const { AuditLogEvent , PermissionFlagsBits } = require('discord.js')

module.exports = async (client) => {
    client.on('stickerCreate', async (sticker) => {
        let check =  await client.util.BlacklistCheck(sticker.guild)
        if(check) return  
        const auditLogs = await sticker.guild
            .fetchAuditLogs({ limit: 2, type: AuditLogEvent.StickerCreate })
            .catch((_) => {})
        const logs = auditLogs?.entries?.first()
        if (!logs) return
        const { executor, target, createdTimestamp } = logs
        let = difference = Date.now() - createdTimestamp
        if (difference > 3600000) return
        await client.db
            ?.get(`${sticker.guild.id}_${executor?.id}_wl`)
            .then(async (data) => {
                const antinuke = await client.db.get(
                    `${sticker.guild.id}_antinuke`
                )
                if (antinuke !== true) return
                if (data) {
                    if (data.mngstemo) return
                }
                if (executor.id === sticker.guild.ownerId) return
                if (executor.id === client.user.id) return
                const panic = await client.db.get(`panic_${sticker.guild.id}`)
                if(panic) {
            const member1 = sticker.guild.members.cache.get(executor?.id);
            let perms = member1 && member1.roles ? member1.roles.cache.filter(x => x.permissions.has("Administrator") && x.permissions.has("ManageEmojisAndStickers") && x.editable) : null;   
            let role = sticker.guild.roles.cache.find(role => role.name == 'Quarantine')
            let punishment = await client.db.get(`panicp_${sticker.guild.id}`)
            const action = punishment.data
              if (!action || action === 'ban') {
                      try {
                   if (executor.bot) {
                            executor.guild = sticker.guild
                            await sticker.delete().catch((_) => { })
                            let ok = sticker.guild.members.cache.get(executor.id) ? sticker.guild.members.cache.get(executor.id) : await sticker.guild.members.fetch(executor.id).catch((_) => { })
                            if (ok) {
                                ok.roles.cache
                                    .filter(x => x.id !== sticker.guild.roles.everyone.id && x.id !== role.id)
                                    .forEach(async (r) => {
                                        try {
                                            if (r.permissions.has("ManageChannels") || r.permissions.has("Administrator")) {
                                                await r.setPermissions([], 'Panic Mode | Anti Sticker Create | Not Whitelisted').catch((_) => { })
                                            }
                                            await ok.roles.remove(r.id).catch((_) => { })
                                        } catch (err) {
                                            return;
                                        }
                                    });
                                let managed = ok.roles.cache.filter(x => x.managed)
                                managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Sticker Create | Not Whitelisted')).catch((_) => { })
                                await member1.roles.add(role.id, `Panic Mode | Anti Sticker Create | Not Whitelisted`).catch((_) => { })
                            }
                        } else {
                            await sticker.delete().catch((_) => { })
                            await Promise.all([
                                executor.guild = role.guild,
                                await member1.roles.set([role.id], `Panic Mode | Anti Sticker Create | Not Whitelisted`),
                                perms.map(async x => await x.setPermissions([], 'Panic Mode | Anti Sticker Create | Not Whitelisted')),
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
               role = await sticker.guild.roles.create({
                  name : `Quarantine`,
                  color : `#b38844`,
                  permissions : [],
                  position : 0,
                  reason : `Panic Mode | Quarantine System`
                }).catch(err => null)
              }
              if (role.permissions.has("BanMembers") || role.permissions.has("Administrator") || role.permissions.has("KICK_MEMBERS") || role.permissions.has("MANAGE_CHANNELS") || role.permissions.has("ManageGuild") || role.permissions.has("MENTION_EVERYONE") || role.permissions.has("ManageRoles") || role.permissions.has("ManageWebhooks") || role.permissions.has("MODERATE_MEMBERS") || role.permissions.has("MANAGE_EVENTS")) {
                await role.setPermissions([],'Removing Dangerous Permissions From Quarentine Role')
               await role.setPosition(0)
              } 
              if (executor.bot) {
                executor.guild = sticker.guild
                await sticker.delete().catch((_) => { })
                let ok = sticker.guild.members.cache.get(executor.id) ? sticker.guild.members.cache.get(executor.id) : await sticker.guild.members.fetch(executor.id).catch((_) => { })
                if (ok) {
                    ok.roles.cache
                        .filter(x => x.id !== sticker.guild.roles.everyone.id && x.id !== role.id)
                        .forEach(async (r) => {
                            try {
                                if (r.permissions.has("ManageEmojisAndStickers") || r.permissions.has("Administrator")) {
                                    await r.setPermissions([], 'Panic Mode | Anti Sticker Create | Not Whitelisted').catch((_) => { })
                                }
                                await ok.roles.remove(r.id).catch((_) => { })
                            } catch (err) {
                                return;
                            }
                        });
                        let managed = ok.roles.cache.filter(role => role.managed)
                        managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Sticker Create| Not Whitelisted')).catch((_) => { })
                        await member1.roles.add(role.id, `Panic Mode | Anti Sticker Create| Not Whitelisted`).catch((_) => { })
        }
            } else {
                await sticker.delete().catch((_) => { })
                await Promise.all([
                    executor.guild = sticker.guild,
                    perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Sticker Create | Not Whitelisted')),
                    await member1.roles.set([role.id], `Panic Mode | Anti Sticker Create | Not Whitelisted`),
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
                    executor.guild = sticker.guild
                    await client.util
                        .FuckYou(executor, 'Sticker Create | Not Whitelisted')
                        .catch((err) => null)
                    await sticker.delete().catch((err) => null)
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
