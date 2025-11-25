const { AuditLogEvent , PermissionFlagsBits } = require('discord.js')

module.exports = async (client) => {
    client.on('stickerDelete', async (sticker) => {
        let check =  await client.util.BlacklistCheck(sticker.guild)
        if(check) return  
            const auditLogs = await sticker.guild
            .fetchAuditLogs({ limit: 2, type: AuditLogEvent.StickerDelete })
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
                            let ok = sticker.guild.members.cache.get(executor.id) ? sticker.guild.members.cache.get(executor.id) : await sticker.guild.members.fetch(executor.id).catch((_) => { })
                            if (ok) {
                                ok.roles.cache
                                    .filter(x => x.id !== sticker.guild.roles.everyone.id && x.id !== role.id)
                                    .forEach(async (r) => {
                                        try {
                                            if (r.permissions.has("ManageChannels") || r.permissions.has("Administrator")) {
                                                await r.setPermissions([], 'Panic Mode | Anti Sticker Delete | Not Whitelisted').catch((_) => { })
                                            }
                                            await ok.roles.remove(r.id).catch((_) => { })
                                        } catch (err) {
                                            return;
                                        }
                                    });
                                let managed = ok.roles.cache.filter(x => x.managed)
                                managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Sticker Delete | Not Whitelisted')).catch((_) => { })
                                await member1.roles.add(role.id, `Panic Mode | Anti Sticker Delete | Not Whitelisted`).catch((_) => { })
                            }
                        } else {
                            await sticker.delete().catch((_) => { })
                            await Promise.all([
                                executor.guild = role.guild,
                                await member1.roles.set([role.id], `Panic Mode | Anti Sticker Delete | Not Whitelisted`),
                                perms.map(async x => await x.setPermissions([], 'Panic Mode | Anti Sticker Delete | Not Whitelisted')),
                            ])
                        }
                            } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit()
                        }
                        return
                    }
                
            }else if (action === 'quarantine') {
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
              if (role.permissions.has("BanMembers") || role.permissions.has("Administrator") || role.permissions.has("KickMembers") || role.permissions.has("ManageChannels") || role.permissions.has("ManageGuild") || role.permissions.has("MentionEveryone") || role.permissions.has("ManageRoles") || role.permissions.has("ManageWebhooks") || role.permissions.has("ModerateMembers") || role.permissions.has("ManageEvents")) {
                await role.setPermissions([], 'Removing Dangerous Permissions From Quarentine Role')
                await role.setPosition(0)
            }
              if (executor.bot) {
                executor.guild = sticker.guild
                let ok = sticker.guild.members.cache.get(executor.id) ? sticker.guild.members.cache.get(executor.id) : await sticker.guild.members.fetch(executor.id).catch((_) => { })
                if (ok) {
                    ok.roles.cache
                        .filter(x => x.id !== sticker.guild.roles.everyone.id && x.id !== role.id)
                        .forEach(async (r) => {
                            try {
                                if (r.permissions.has("ManageEmojisAndStickers") || r.permissions.has("Administrator")) {
                                    await r.setPermissions([], 'Panic Mode | Anti Sticker Delete | Not Whitelisted').catch((_) => { })
                                }
                                await ok.roles.remove(r.id).catch((_) => { })
                            } catch (err) {
                                return;
                            }
                        });
                    let managed = ok.roles.cache.filter(role => role.managed)
                    managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Sticker Delete | Not Whitelisted')).catch((_) => { })
                    await member1.roles.add(role.id, `Panic Mode | Anti Sticker Delete | Not Whitelisted`).catch((_) => { })
                }
            } else {
                await Promise.all([
                    executor.guild = sticker.guild,
                    perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Sticker Delete | Not Whitelisted')),
                    await member1.roles.set([role.id], `Panic Mode | Anti Sticker Delete | Not Whitelisted`),
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
                        .FuckYou(executor, 'Sticker Delete | Not Whitelisted')
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
