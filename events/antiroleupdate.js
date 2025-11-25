const { getSettings } = require('../models/mainrole')
const { AuditLogEvent , PermissionsBitField } = require('discord.js')
module.exports = async (client) => {
    /* Anti Role Update */
    client.on('roleUpdate', async (o, n) => {
        let check =  await client.util.BlacklistCheck(o.guild)
        if(check) return  
            const auditLogs = await n.guild
            .fetchAuditLogs({ limit: 2, type: AuditLogEvent.RoleUpdate })
            .catch((_) => {})
        const logs = auditLogs?.entries?.first()
        if (!logs) return
        const { executor, target, createdTimestamp } = logs
        let = difference = Date.now() - createdTimestamp
        if (difference > 3600000) return
        await client.db
            ?.get(`${o.guild.id}_${executor?.id}_wl`)
            .then(async (data) => {
                const antinuke = await client.db.get(`${o.guild.id}_antinuke`)
                if (antinuke !== true && !antinuke.antiroleupdate) return
                if (data) {
                    if (data.rlup) return
                }
                if (executor.id === n.guild.ownerId) return
                if (executor.id === client.user.id) return
            
                const panic = await client.db.get(`panic_${o.guild.id}`)
                if(panic) {
            const member1 = o.guild.members.cache.get(executor?.id);
            let perms = member1.roles.cache.filter(x => x.permissions.has("Administrator") && x.permissions.has("BanMembers") && x.editable);        
            let role = o.guild.roles.cache.find(role => role.name == 'Quarantine')
            let punishment = await client.db.get(`panicp_${o.guild.id}`)
            const action = punishment.data
              if (!action || action === 'ban') {
                      try {
                        if(executor.bot) {
                        const settings = await getSettings(n.guild)
                        if (
                            !settings.mainrole.includes(n.id) &&
                            n.name !== '@everyone'
                        ) {
                            await n.setPermissions(o.permissions).catch(() => null)
                            await n.setName(o.name).catch(() => null)
                            await n.setColor(o.color).catch(() => null)
                            await n.setHoist(o.hoist).catch(() => null)
                        } else if (settings.mainrole?.includes(n.id)) {
                            n.setPermissions([
                                PermissionsBitField.Flags.CreateInstantInvite,
                                PermissionsBitField.Flags.PrioritySpeaker,
                                PermissionsBitField.Flags.Stream,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.Connect,
                                PermissionsBitField.Flags.Speak,
                                PermissionsBitField.Flags.ChangeNickname
                            ])
                        } else if (n.name === '@everyone') {
                            n.guild.roles.everyone.setPermissions([
                                PermissionsBitField.Flags.CreateInstantInvite,
                                PermissionsBitField.Flags.PrioritySpeaker,
                                PermissionsBitField.Flags.Stream,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.Connect,
                                PermissionsBitField.Flags.Speak,
                                PermissionsBitField.Flags.ChangeNickname
                            ])
                        }
                        let ok = o.guild.members.cache.get(o.author.id) ? o.guild.members.cache.get(o.author.id) : await o.guild.members.fetch(o.author.id).catch((_) => { })
                        if (ok) {
                            ok.roles.cache
                                .filter(x => x.id !== o.guild.roles.everyone.id && x.id !== role.id)
                                .forEach(async (r) => {
                                    try {
                                        if (r.permissions.has("MentionEveryone") || r.permissions.has("Administrator")) {
                                            await r.setPermissions([], 'Panic Mode | Anti Role Update | Not Whitelisted').catch((_) => { })
                                        }
                                        await ok.roles.remove(r.id).catch((_) => { })
                                    } catch (err) {
                                        return;
                                    }
                                });
                                let managed = ok.roles.cache.filter(role => role.managed)
                                managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Role Update | Not Whitelisted')).catch((_) => { })
                                await client.util.FuckYou(executor, 'Panic Mode | Anti Role Update | Not Whitelisted').catch((_) => { })
                            }
                    } else {
                        const settings = await getSettings(n.guild)
                        if (
                            !settings.mainrole.includes(n.id) &&
                            n.name !== '@everyone'
                        ) {
                            await n.setPermissions(o.permissions).catch(() => null)
                            await n.setName(o.name).catch(() => null)
                            await n.setColor(o.color).catch(() => null)
                            await n.setHoist(o.hoist).catch(() => null)
                        } else if (settings.mainrole?.includes(n.id)) {
                            n.setPermissions([
                                PermissionsBitField.Flags.CreateInstantInvite,
                                PermissionsBitField.Flags.PrioritySpeaker,
                                PermissionsBitField.Flags.Stream,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.Connect,
                                PermissionsBitField.Flags.Speak,
                                PermissionsBitField.Flags.ChangeNickname
                            ])
                        } else if (n.name === '@everyone') {
                            n.guild.roles.everyone.setPermissions([
                                PermissionsBitField.Flags.CreateInstantInvite,
                                PermissionsBitField.Flags.PrioritySpeaker,
                                PermissionsBitField.Flags.Stream,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.Connect,
                                PermissionsBitField.Flags.Speak,
                                PermissionsBitField.Flags.ChangeNickname
                            ])
                        }
                await Promise.all([      
                             executor.guild = o.guild,
                            await member1.roles.remove(perms, `Panic Mode | Anti Role Update | Not Whitelisted`),
                            await perms.map(role => role.setPermissions([], 'Panic Mode | Anti Role Update | Not Whitelisted')),
                            await client.util.FuckYou(executor, 'Panic Mode | Anti Role Update | Not Whitelisted'),
                                ])
                await client.util.sleep(2000)
                   }
                         } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit()
                        }
                        return
                    }
                
            } else if (action === 'quarantine') {
        try {
            if(!role) {
               role = await o.guild.roles.create({
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
              if(executor.bot) {
                const settings = await getSettings(n.guild)
                if (
                    !settings.mainrole.includes(n.id) &&
                    n.name !== '@everyone'
                ) {
                    await n.setPermissions(o.permissions).catch(() => null)
                    await n.setName(o.name).catch(() => null)
                    await n.setColor(o.color).catch(() => null)
                    await n.setHoist(o.hoist).catch(() => null)
                } else if (settings.mainrole?.includes(n.id)) {
                    n.setPermissions([
                        PermissionsBitField.Flags.CreateInstantInvite,
                        PermissionsBitField.Flags.PrioritySpeaker,
                        PermissionsBitField.Flags.Stream,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.Speak,
                        PermissionsBitField.Flags.ChangeNickname
                    ])
                } else if (n.name === '@everyone') {
                    n.guild.roles.everyone.setPermissions([
                        PermissionsBitField.Flags.CreateInstantInvite,
                        PermissionsBitField.Flags.PrioritySpeaker,
                        PermissionsBitField.Flags.Stream,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.Speak,
                        PermissionsBitField.Flags.ChangeNickname
                    ])
                }
                let ok = o.guild.members.cache.get(o.author.id) ? o.guild.members.cache.get(o.author.id) : await o.guild.members.fetch(o.author.id).catch((_) => { })
                if (ok) {
                    ok.roles.cache
                        .filter(x => x.id !== o.guild.roles.everyone.id && x.id !== role.id)
                        .forEach(async (r) => {
                            try {
                                if (r.permissions.has("MentionEveryone") || r.permissions.has("Administrator")) {
                                    await r.setPermissions([], 'Panic Mode | Anti Role Update | Not Whitelisted').catch((_) => { })
                                }
                                await ok.roles.remove(r.id).catch((_) => { })
                            } catch (err) {
                                return;
                            }
                        });
                        let managed = ok.roles.cache.filter(role => role.managed)
                        managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Role Update | Not Whitelisted')).catch((_) => { })
                        await member1.roles.add(role.id, `Panic Mode | Anti Role Update | Not Whitelisted`).catch((_) => { })
                    }
            } else {
                const settings = await getSettings(n.guild)
                if (
                    !settings.mainrole.includes(n.id) &&
                    n.name !== '@everyone'
                ) {
                    await n.setPermissions(o.permissions).catch(() => null)
                    await n.setName(o.name).catch(() => null)
                    await n.setColor(o.color).catch(() => null)
                    await n.setHoist(o.hoist).catch(() => null)
                } else if (settings.mainrole?.includes(n.id)) {
                    n.setPermissions([
                        PermissionsBitField.Flags.CreateInstantInvite,
                        PermissionsBitField.Flags.PrioritySpeaker,
                        PermissionsBitField.Flags.Stream,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.Speak,
                        PermissionsBitField.Flags.ChangeNickname
                    ])
                } else if (n.name === '@everyone') {
                    n.guild.roles.everyone.setPermissions([
                        PermissionsBitField.Flags.CreateInstantInvite,
                        PermissionsBitField.Flags.PrioritySpeaker,
                        PermissionsBitField.Flags.Stream,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.Speak,
                        PermissionsBitField.Flags.ChangeNickname
                    ])
                }
        await Promise.all([      
                     executor.guild = o.guild,
                    await member1.roles.remove(perms, `Panic Mode | Anti Role Update | Not Whitelisted`),
                    await perms.map(role => role.setPermissions([], 'Panic Mode | Anti Role Update | Not Whitelisted')),
                    await member1.roles.set([role.id], `Panic Mode | Anti Role Update | Not Whitelisted`).catch((_) => { })
                ])
        await client.util.sleep(2000)
           }
                 } catch (err) {
                if (err.code === 429) {
                    await client.util.handleRateLimit()
                }
                return
                 }}
                } else {
            executor.guild = n.guild,
            await client.util.FuckYou(executor, 'Role Update | Not Whitelisted').catch((err) => null)
                const settings = await getSettings(n.guild)
                if (
                    !settings.mainrole.includes(n.id) &&
                    n.name !== '@everyone'
                ) {
                    await n.setPermissions(o.permissions).catch(() => null)
                    await n.setName(o.name).catch(() => null)
                    await n.setColor(o.color).catch(() => null)
                    await n.setHoist(o.hoist).catch(() => null)
                } else if (settings.mainrole) {
                    if (settings.mainrole.includes(n.id)) {
                        await n.setPermissions([
                            PermissionsBitField.Flags.CreateInstantInvite,
                            PermissionsBitField.Flags.PrioritySpeaker,
                            PermissionsBitField.Flags.Stream,
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.Connect,
                            PermissionsBitField.Flags.Speak,
                            PermissionsBitField.Flags.ChangeNickname
                        ])
                    }
                } else if (n.name === '@everyone') {
                    await   n.guild.roles.everyone.setPermissions([
                        PermissionsBitField.Flags.CreateInstantInvite,
                        PermissionsBitField.Flags.PrioritySpeaker,
                        PermissionsBitField.Flags.Stream,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                        PermissionsBitField.Flags.Connect,
                        PermissionsBitField.Flags.Speak,
                        PermissionsBitField.Flags.ChangeNickname
                    ])
                }
                }})
    })
}
