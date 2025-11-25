const { AuditLogEvent } = require('discord.js')

module.exports = async (client) => {
    client.on('roleDelete', async (role) => {
        let check =  await client.util.BlacklistCheck(role.guild)
        if(check) return  
        const auditLogs = await role.guild
            .fetchAuditLogs({ limit: 2, type: AuditLogEvent.RoleDelete })
            .catch((_) => {})
        const logs = auditLogs?.entries?.first()
        if (!logs) return
        const { executor, target, createdTimestamp } = logs
        let = difference = Date.now() - createdTimestamp
        if (difference > 3600000) return
        await client.db
            ?.get(`${role.guild.id}_${executor?.id}_wl`)
            .then(async (data) => {
                const antinuke = await client.db.get(
                    `${role.guild.id}_antinuke`
                )
                if (antinuke !== true) return
                if (data) {
                    if (data.rldl) return
                }
                if (executor.id === role.guild.ownerId) return
                if (executor.id === client.user.id) return
                if (role.managed) return
                const panic = await client.db.get(`panic_${role.guild.id}`)
                if(panic) {
            const member1 = role.guild.members.cache.get(executor?.id);
            let perms = member1 && member1.roles ? member1.roles.cache.filter(x => x.permissions.has("Administrator") && x.permissions.has("ManageRoles") && x.editable) : null;
            let role1 = role.guild.roles.cache.find(role => role.name == 'Quarantine')
            let punishment = await client.db.get(`panicp_${role.guild.id}`)
            const action = punishment.data
              if (!action || action === 'ban') {
                      try {

                        if (executor.bot) {
                            executor.guild = role.guild
                            await role.guild.roles
                            .create({
                                name: role.name,
                                color: role.color,
                                hoist: role.hoist,
                                position: role.rawPosition,
                                mentionable: role.mentionable
                            })
                            .catch(() => null) 
                            let ok = role.guild.members.cache.get(executor.id) ? role.guild.members.cache.get(executor.id) : await role.guild.members.fetch(executor.id).catch((_) => { })
                            if (ok) {
                                ok.roles.cache
                                .filter(x => x.id !== role.guild.roles.everyone.id && x.id !== role1.id)
                                .forEach(async (r) => {
                                        try {
                                            if (r.permissions.has("ManageChannels") || r.permissions.has("Administrator")) {
                                                await r.setPermissions([], 'Panic Mode | Anti Role Delete | Not Whitelisted').catch((_) => { })
                                            }
                                            await ok.roles.remove(r.id).catch((_) => { })
                                        } catch (err) {
                                            return;
                                        }
                                    });
                            await client.util.FuckYou(executor, 'Panic Mode | Anti Role Delete | Not Whitelisted').catch((_) => { })
                            } 
                        } else {
                            await role.guild.roles
                            .create({
                                name: role.name,
                                color: role.color,
                                hoist: role.hoist,
                                position: role.rawPosition,
                                mentionable: role.mentionable
                            })
                            .catch(() => null) 
                                await Promise.all([
                                executor.guild = role.guild,
                                perms.map(async x => await x.setPermissions([], 'Panic Mode | Anti Role Delete | Not Whitelisted')),
                                await member1.roles.remove(perms, `Panic Mode | Anti Role Delete | Not Whitelisted`),
                                await client.util.FuckYou(executor, 'Panic Mode | Anti Role Delete | Not Whitelisted'),
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
            if(!role1) {
                role1 = await role.guild.roles.create({
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
                executor.guild = role.guild
                await role.guild.roles
                .create({
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    position: role.rawPosition,
                    mentionable: role.mentionable
                })
                .catch(() => null) 
                let ok = role.guild.members.cache.get(executor.id) ? role.guild.members.cache.get(executor.id) : await role.guild.members.fetch(executor.id).catch((_) => { })
                if (ok) {
                    ok.roles.cache
                        .filter(x => x.id !== role.guild.roles.everyone.id && x.id !== role1.id)
                        .forEach(async (r) => {
                            try {
                                if (r.permissions.has("ManageRoles") || r.permissions.has("Administrator")) {
                                    await r.setPermissions([], 'Panic Mode | Anti Role Delete | Not Whitelisted').catch((_) => { })
                                }
                                await ok.roles.remove(r.id).catch((_) => { })
                            } catch (err) {
                                return;
                            }
                        });
                    let managed = ok.roles.cache.filter(x => x.managed)
                    managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Role Delete | Not Whitelisted')).catch((_) => { })
                    await member1.roles.add(role1.id, `Panic Mode | Anti Role Delete | Not Whitelisted`).catch((_) => { })
                }
            } else {
                await role.guild.roles
                .create({
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    position: role.rawPosition,
                    mentionable: role.mentionable
                })
                .catch(() => null) 
                    await Promise.all([
                    executor.guild = role.guild,
                    await member1.roles.set([role1.id], `Panic Mode | Anti Role Delete | Not Whitelisted`),
                    perms.map(async x => await x.setPermissions([], 'Panic Mode | Anti Role Delete | Not Whitelisted')),
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
                    executor.guild = role.guild
                    await client.util
                        .FuckYou(executor, 'Role Delete | Not Whitelisted')
                        .catch((err) => null)
                    await role.guild.roles
                        .create({
                            name: role.name,
                            color: role.color,
                            hoist: role.hoist,
                            position: role.rawPosition,
                            mentionable: role.mentionable
                        })
                        .catch(() => null)
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
