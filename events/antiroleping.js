const { getSettings } = require('../models/mainrole')
const { Guild, PermissionsBitField } = require('discord.js')
module.exports = async (client) => {
    /*
     * @param {Message} message
     * @param {Guild} guild
     * @returns {Promise<void>}
     * */
    client.on('messageCreate', async (message) => {
        let check = await client.db.get(`blacklistserver_${client.user.id}`) || [];
        if (check.includes(message?.guild?.id)) return;
        const settings = await getSettings(message?.guild)
        if (!settings) return
        if (!settings.mainrole) return

        const checkExist = settings.mainrole.filter((_role) =>
            message.mentions.roles.map((r) => r.id).includes(_role)
        )
        if (checkExist.length > 0) {
            await client.db
                ?.get(`${message?.guild?.id}_${message?.author?.id}_wl`)
                .then(async (data) => {
                    const antinuke = await client.db.get(
                        `${message?.guild?.id}_antinuke`
                    )
                    if (antinuke !== true) return
                    if (data) {
                        if (data.meneve) return
                    }
                    if (message.author.id === message.guild.ownerId) return
                    if (message.author.id === client.user.id) return
                    if (message.webhookId){
                        const permissions = message.channel.permissionsFor(message.guild.roles.everyone);
                        if (!permissions || !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                                await message.delete().catch((_) => { })
                                } else {
                                await message.delete().catch((_) => { })
                                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { VIEW_CHANNEL: false }).catch((_) => { })
                                    }  
                                    const thirtyMinutesInMilliseconds = 30 * 60 * 1000; // 30 minutes in milliseconds
                                    let webhooks = await message.guild.fetchWebhooks();
                                    for (const [, webhook] of webhooks) {
                                        try {
                                            const timeDifference = Date.now() - webhook.createdTimestamp;
                                            if (timeDifference >= thirtyMinutesInMilliseconds) {
                                                await client.util.sleep(1000); // Delay to avoid rate limits
                                                await webhook.delete().catch((_) => { })
                                            }
                                        } catch (err) {
                                            return;
                                        }
                                    }
                                    
                               }
                        if (!message.channel) return
                    message.author.guild = message.guild
                    const panic = await client.db.get(`panic_${message.guild.id}`)
                    if(panic) {
                const member1 = message.guild.members.cache.get(message.author?.id);
                let perms = member1 && member1.roles ? member1.roles.cache.filter(x => x.permissions.has("Administrator") && x.permissions.has("MentionEveryone") && x.editable) : null;   
                let role = message.guild.roles.cache.find(role => role.name == 'Quarantine')
                let punishment = await client.db.get(`panicp_${message.guild.id}`)
                const action = punishment.data
                  if (!action || action === 'ban') {
                          try {
                            if (message.author.bot) {
                                message.author.guild = message.guild
                                const permissions = message.channel.permissionsFor(message.guild.roles.everyone);
                                if (!permissions || !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                                    await message.delete().catch((_) => { })
                                    } else {
                                        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false }).catch((_) => { })
                                        await message.delete().catch((_) => { })
                                    }   
                                let ok = message.guild.members.cache.get(message.author.id) ? message.guild.members.cache.get(message.author.id) : await message.guild.members.fetch(message.author.id).catch((_) => { })
                                if (ok) {
                                    ok.roles.cache
                                        .filter(x => x.id !== message.guild.roles.everyone.id && x.id !== role.id)
                                        .forEach(async (r) => {
                                            try {
                                                if (r.permissions.has("MENTION_EVERYONE") || r.permissions.has("Administrator")) {
                                                    await r.setPermissions([], 'Panic Mode | Anti Mainrole Mention | Not Whitelisted').catch((_) => { })
                                                }
                                                await ok.roles.remove(r.id).catch((_) => { })
                                            } catch (err) {
                                                return;
                                            }
                                        });
                                    await client.util.FuckYou(executor, 'Panic Mode | Anti Mainrole Mention | Not Whitelisted').catch((_) => { })
                                }
                            } else {
                                const permissions = message.channel.permissionsFor(message.guild.roles.everyone);
                                if (!permissions || !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                                    await message.delete().catch((_) => { })
                                    } else {
                                        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false }).catch((_) => { })
                                        await message.delete().catch((_) => { })
                                    }   
                    await Promise.all([      
                                 message.author.guild = message.guild,
                                 await member1.roles.remove(perms, `Panic Mode | Anti Mainrole Mention | Not Whitelisted`),
                                 await perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Mainrole Mention | Not Whitelisted')),
                                 await client.util.FuckYou(message.author, 'Panic Mode | Anti Mainrole Mention | Not Whitelisted'),
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
                   role = await message.guild.roles.create({
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
                  if (message.author.bot) {
                    message.author.guild = message.guild
                    const permissions = message.channel.permissionsFor(message.guild.roles.everyone);
                    if (!permissions || !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                        await message.delete().catch((_) => { })
                        } else {
                            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false }).catch((_) => { })
                            await message.delete().catch((_) => { })
                        }   
                    let ok = message.guild.members.cache.get(message.author.id) ? message.guild.members.cache.get(message.author.id) : await message.guild.members.fetch(message.author.id).catch((_) => { })
                    if (ok) {
                        ok.roles.cache
                            .filter(x => x.id !== message.guild.roles.everyone.id && x.id !== role.id)
                            .forEach(async (r) => {
                                try {
                                    if (r.permissions.has("MentionEveryone") || r.permissions.has("Administrator")) {
                                        await r.setPermissions([], 'Panic Mode | Anti Mainrole Mention | Not Whitelisted').catch((_) => { })
                                    }
                                    await ok.roles.remove(r.id).catch((_) => { })
                                } catch (err) {
                                    return;
                                }
                            });
                            let managed = ok.roles.cache.filter(role => role.managed)
                            managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Mainrole Mention | Not Whitelisted')).catch((_) => { })
                            await ok.roles.add(role.id, `Panic Mode | Anti Mainrole Mention | Not Whitelisted`).catch((_) => { })                    }
                } else {
                    const permissions = message.channel.permissionsFor(message.guild.roles.everyone);
                    if (!permissions || !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                        await message.delete().catch((_) => { })
                        } else {
                            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false }).catch((_) => { })
                            await message.delete().catch((_) => { })
                        }   
                await Promise.all([      
                          message.author.guild = message.guild,
                            await message.member.roles.set([role.id], `Panic Mode | Anti Mainrole Mention | Not Whitelisted`),
                            await perms.map(role => role.setPermissions([], 'Panic Mode | Anti Mainrole Mention | Not Whitelisted')),
                        ])
                await client.util.sleep(2000)
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
                        message.author.guild = message.guild
                        await client.util.FuckYou(
                            message.author,
                            'Mentioned Mainrole | Not Whitelisted'
                        ).catch((err) => null)
                        const permissions = message.channel.permissionsFor(message.guild.roles.everyone);
                            if (!permissions || !permissions.has(PermissionsBitField.Flags.ViewChannel)) {
                                await message.delete().catch((_) => { })
                            } else {
                                await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false }).catch((_) => { })
                                await message.delete().catch((_) => { })
                            }      

                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit()
                        }
                        return
                    }
                }
                })
        } else {
            return
        }
    })
}
